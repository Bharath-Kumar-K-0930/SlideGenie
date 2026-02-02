import json
import logging
from typing import Optional, List, Literal
import asyncio
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.presentation import PresentationStructure, ConceptPlan, Slide
from app.services.planner import Planner
from app.services.slide_writer import SlideWriter
from app.services.validator import Validator

# Setup logger
logger = logging.getLogger(__name__)

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

    async def generate_structure(self, text: str, slide_count: int = 5, audience: Literal["general", "technical"] = "general") -> PresentationStructure:
        """
        GAMMA-LEVEL ORCHESTRATOR:
        1. Audience Normalization (Prompt Engineering)
        2. Topic Decomposition (The Planner)
        3. Parallel Slide Expansion (The Writer) + Auto-Retry Loop (The Validator)
        """
        if not self.client or settings.MOCK_AI:
            logger.info("Using MOCK AI response")
            await asyncio.sleep(1.5)
            return self._get_mock_response(slide_count, text)

        # 1. Technical vs Non-Technical Tuning
        normalized_text = self._normalize_prompt(text, audience)

        try:
            # 2. Topic Planner Phase
            plan_content = await self.planner.generate_outline(normalized_text, slide_count)
            concept_plan = ConceptPlan(**json.loads(plan_content))
            logger.info(f"Planned: {concept_plan.topic}")

            # 3. Slide Generator Phase (Parallel execution with validation)
            tasks = [self._write_with_retry(section) for section in concept_plan.sections]
            slides = await asyncio.gather(*tasks)
            
            presentation = PresentationStructure(
                topic=concept_plan.topic,
                slides=slides
            )

            # Final size check
            if len(presentation.slides) > 15:
                presentation.slides = presentation.slides[:15]
            
            return presentation

        except Exception as e:
            logger.error(f"Senior Pipeline Orchestration Error: {e}")
            raise e

    async def _write_with_retry(self, section, retries=2) -> Slide:
        """The expansion loop with validator"""
        for i in range(retries):
            try:
                content = await self.writer.generate_slide(
                    section.section_title, 
                    section.what_to_cover, 
                    is_retry=(i > 0)
                )
                slide_json = json.loads(content)
                
                if Validator.is_valid_slide(slide_json):
                    return Slide(title=slide_json["title"], points=slide_json["bullet_points"])
                
                logger.warning(f"Low-quality slide detected for '{section.section_title}', retry {i+1}...")
            except Exception as e:
                logger.error(f"Slide expansion error for '{section.section_title}': {e}")
                
        # Safe fallback
        return Slide(
            title=section.section_title, 
            points=["Refer to technical documentation for in-depth details.", "Standard implementation protocols apply.", "Evaluate performance based on specific use cases."]
        )

    def _normalize_prompt(self, user_prompt: str, audience: str) -> str:
        """Internal prompt engineering based on audience"""
        if audience == "technical":
            return f"Create a technical presentation for computer science students. Use formal terminology, explain architecture/mechanisms, and provide data-driven examples. Topic: \"{user_prompt}\""
        else:
            return f"Create an easy-to-understand presentation for a general audience. Avoid jargon, use real-world analogies, and keep descriptions simple and engaging. Topic: \"{user_prompt}\""

    def _get_mock_response(self, slide_count: int, text: str) -> PresentationStructure:
        topic = text[:40] + "..." if len(text) > 40 else text
        slides = []
        for i in range(slide_count):
            slides.append({
                "title": f"Structural Component {i+1} for {topic}",
                "points": ["Major industry drivers", "Core conceptual overview", "Scope of the discussion"]
            })
        return PresentationStructure(topic=topic, slides=slides)

content_engine = ContentEngine()
