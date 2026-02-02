import json
import logging
from typing import Optional, List, Literal
import asyncio
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.prompts import (
    CONCEPT_PLANNER_PROMPT, 
    SLIDE_CONTENT_PROMPT, 
    DOMAIN_RULES, 
    PROMPT_IMPROVER_PROMPT
)
from app.schemas.presentation import PresentationStructure, ConceptPlan, Slide

# Setup logger
logger = logging.getLogger(__name__)

from app.services.planner import Planner
from app.services.slide_writer import SlideWriter
from app.services.validator import Validator

class ContentEngine:
    def __init__(self):
        self.client = None
        self.planner = None
        self.writer = None
        
        if settings.OPENAI_API_KEY:
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            self.planner = Planner(self.client)
            self.writer = SlideWriter(self.client)
        else:
            logger.warning("OPENAI_API_KEY not found. AI features will fail or use mock data.")

    async def improve_user_prompt(self, user_input: str) -> str:
        """UX Power Feature: Rewrites weak prompts into structured requests."""
        if not self.client:
            return user_input
            
        try:
            prompt = PROMPT_IMPROVER_PROMPT.format(user_input=user_input)
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Prompt improvement error: {e}")
            return user_input

    async def generate_structure(self, text: str, slide_count: int = 5, audience: str = "general", domain: str = "general") -> PresentationStructure:
        """
        PRODUCTION-GRADE PIPELINE:
        1. Domain-Aware Expansion
        2. Stage 1 Planner (Topic Decomposition)
        3. Stage 2 Parallel Expansion + Stage 3 Confidence Scoring & Retry
        """
        if not self.client or settings.MOCK_AI:
            logger.info("Using MOCK AI response")
            await asyncio.sleep(1.5)
            return self._get_mock_response(slide_count, text)

        # 1. Domain Detection / Audience Normalization
        # Combining audience and domain for rules
        domain_rules = DOMAIN_RULES.get(domain, DOMAIN_RULES["general"])
        if audience == "technical" and domain == "general":
            domain_rules = DOMAIN_RULES["technical"]

        try:
            # 2. Topic Planner Phase
            plan_content = await self.planner.generate_outline(text, slide_count)
            concept_plan = ConceptPlan(**json.loads(plan_content))
            logger.info(f"Planned Domain: {domain} | Topic: {concept_plan.topic}")

            # 3. Slide Generator Phase (Parallel execution with AI Scoring)
            tasks = [self._write_with_ai_scoring(section, domain_rules) for section in concept_plan.sections]
            slides = await asyncio.gather(*tasks)
            
            presentation = PresentationStructure(
                topic=concept_plan.topic,
                slides=slides
            )

            return presentation

        except Exception as e:
            logger.error(f"Advanced Pipeline Error: {e}")
            raise e

    async def _write_with_ai_scoring(self, section, domain_rules: str, max_retries=2) -> Slide:
        """Stage 2 + 3: Expansion with Confidence Scoring Retry Loop"""
        for i in range(max_retries):
            try:
                # generate
                content = await self.writer.generate_slide(
                    section.section_title, 
                    section.what_to_cover, 
                    domain_rules=domain_rules,
                    is_retry=(i > 0)
                )
                slide_json = json.loads(content)
                title = slide_json["title"]
                points = slide_json["bullet_points"]

                # score 1: Fast keyword check
                if not Validator.is_valid_slide_text(title, points):
                    logger.warning(f"Keyword check failed for '{title}', retrying...")
                    continue

                # score 2: AI Confidence score
                score = await Validator.get_confidence_score(self.client, title, points)
                if score >= 75:
                    logger.info(f"Slide '{title}' passed with score {score}")
                    return Slide(title=title, points=points)
                
                logger.warning(f"Low AI score ({score}) for '{title}', retrying {i+1}...")
            except Exception as e:
                logger.error(f"Expansion loop error: {e}")

        # Fallback
        return Slide(
            title=section.section_title, 
            points=["Thematic details for this section are being processed.", "Ensure factual accuracy in final review.", "Consult domain-specific resources."]
        )

    def _get_mock_response(self, slide_count: int, text: str) -> PresentationStructure:
        topic = text[:40] + "..." if len(text) > 40 else text
        slides = []
        for i in range(slide_count):
            slides.append({
                "title": f"Structural Component {i+1} for {topic}",
                "points": ["Fact-based overview of component", "Domain-specific mechanism detail", "Case study reference"]
            })
        return PresentationStructure(topic=topic, slides=slides)

content_engine = ContentEngine()
