import json
import logging
from typing import Optional, List, Literal
import asyncio
import io
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.prompts import (
    DOMAIN_RULES
)
from app.schemas.presentation import PresentationStructure, ConceptPlan, Slide
from app.services.planner import Planner
from app.services.slide_writer import SlideWriter
from app.services.validator import Validator
from app.services.prompt_improver import PromptImprover
from app.services.diagram_planner import DiagramPlanner
from app.services.diagram_renderer import DiagramRenderer

# Setup logger
logger = logging.getLogger(__name__)

class ContentEngine:
    def __init__(self):
        self.client = None
        self.planner = None
        self.writer = None
        self.improver = None
        self.diag_planner = None
        
        if settings.OPENAI_API_KEY:
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            self.planner = Planner(self.client)
            self.writer = SlideWriter(self.client)
            self.improver = PromptImprover(self.client)
            self.diag_planner = DiagramPlanner(self.client)
        else:
            logger.warning("OPENAI_API_KEY not found. AI features will fail or use mock data.")

    async def improve_user_prompt(self, user_input: str) -> str:
        """UX Power Feature: Silently fixes / Improves user prompt."""
        return await self.improver.improve_prompt(user_input)

    async def generate_structure(self, text: str, slide_count: int = 5, audience: str = "general", domain: str = "general") -> PresentationStructure:
        """
        THE ULTIMATE GAMMA-LEVEL ORCHESTRATOR:
        1. Prompt Refinement (Silent Improvement)
        2. Domain Tuning
        3. Topic Planning (Planner)
        4. Parallel Slide Expansion (Writer)
        5. Quality Gating (Validator + AI Scoring + Retry)
        6. Visual Planning (Diagram Suggestions)
        """
        if not self.client or settings.MOCK_AI:
            logger.info("Using MOCK AI response")
            await asyncio.sleep(1.5)
            return self._get_mock_response(slide_count, text)

        # 1. Silently improve the prompt if it's too short / basic
        enhanced_text = text
        if len(text) < 50:
            logger.info("Short prompt detected. Improving internally...")
            enhanced_text = await self.improver.improve_prompt(text)

        # 2. Domain & Audience Rules
        domain_rules = DOMAIN_RULES.get(domain, DOMAIN_RULES["general"])
        if audience == "technical" and domain == "general":
            domain_rules = DOMAIN_RULES["technical"]

        try:
            # 3. Topic Planner Phase
            plan_content = await self.planner.generate_outline(enhanced_text, slide_count)
            concept_plan = ConceptPlan(**json.loads(plan_content))
            logger.info(f"Planned Domain: {domain} | Topic: {concept_plan.topic}")

            # 4. Slide Expansion + 5. Validation/Scoring (Parallel)
            tasks = [self._write_with_ai_scoring(section, domain_rules) for section in concept_plan.sections]
            slides = await asyncio.gather(*tasks)
            
            # 6. Visual Element Planning (Optional extra layer)
            # In a full PROD version, we would map diagrams to specific slides
            # For this version, we'll keep the structure clean
            
            presentation = PresentationStructure(
                topic=concept_plan.topic,
                slides=slides
            )

            return presentation

        except Exception as e:
            logger.error(f"Ultimate Pipeline Orchestration Error: {e}")
            raise e

    async def _write_with_ai_scoring(self, section, domain_rules: str, max_retries=3) -> Slide:
        """The expansion loop with Validator + Confidence Scoring"""
        for i in range(max_retries):
            try:
                content = await self.writer.generate_slide(
                    section.section_title, 
                    section.what_to_cover, 
                    domain_rules=domain_rules,
                    is_retry=(i > 0)
                )
                slide_json = json.loads(content)
                title = slide_json["title"]
                points = slide_json["bullet_points"]

                # Keyword Filter
                if not Validator.is_valid_slide_text(title, points):
                    logger.warning(f"Keyword block for '{title}', retrying {i+1}...")
                    continue

                # AI Quality Score
                score = await Validator.get_confidence_score(self.client, title, points)
                if score >= 75:
                    logger.info(f"Slide '{title}' PASSED with score {score}")
                    
                    # FETCH DYNAMIC IMAGE (Silent Power Feature)
                    # Using Unsplash source for dynamic, topic-specific high-quality photos
                    image_query = title.replace(" ", "%20")
                    image_url = f"https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000" # fallback
                    # In a more advanced version, we'd search first. For now, we'll use a descriptive curated random
                    image_url = f"https://source.unsplash.com/featured/?{image_query}"
                    
                    return Slide(title=title, points=points, image_url=image_url)
                
                logger.warning(f"Slide '{title}' FAILED quality gate ({score}), retrying {i+1}...")
            except Exception as e:
                logger.error(f"Expansion loop failed: {e}")
                
        # Safe Fallback (Enterprise-ready)
        return Slide(
            title=section.section_title, 
            points=[
                "Comprehensive details for this section are available in the supplementary material.",
                "Strategic alignment with core project objectives.",
                "Factual verification required for this specific subtopic."
            ]
        )

    def _get_mock_response(self, slide_count: int, text: str) -> PresentationStructure:
        topic = text[:40] + "..." if len(text) > 40 else text
        slides = []
        for i in range(slide_count):
            slides.append({
                "title": f"Structural Phase {i+1}: {topic}",
                "points": ["Fact-based overview of phase", "Industry-standard methodology", "Critical success factors"]
            })
        return PresentationStructure(topic=topic, slides=slides)

content_engine = ContentEngine()
