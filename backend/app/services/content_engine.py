import json
import logging
from typing import Optional, List
import asyncio
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.prompts import CONCEPT_PLANNER_PROMPT, SLIDE_CONTENT_PROMPT
from app.schemas.presentation import PresentationStructure, ConceptPlan, Slide

# Setup logger
logger = logging.getLogger(__name__)

FORBIDDEN_WORDS = [
    "overview",
    "key aspect",
    "important detail",
    "implementation strategy",
    "optimization",
    "performance metrics",
    "placeholder",
    "supporting evidence",
    "generic concept"
]

class ContentEngine:
    def __init__(self):
        # Initialize OpenAI client only if API key is present
        self.client = None
        if settings.OPENAI_API_KEY:
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            logger.warning("OPENAI_API_KEY not found. AI features will fail or use mock data.")

    async def generate_structure(self, text: str, slide_count: int = 5) -> PresentationStructure:
        """
        Generates structured JSON content for slides using the Gamma-style pipeline:
        Step 1: Topic Decomposition (Concept Planner AI)
        Step 2: Content Expansion (Slide-by-slide Generator)
        Step 3: Validation & Polishing
        """
        # Step 0: Handle MOCK_AI or missing client
        if not self.client or settings.MOCK_AI:
            logger.info("Using MOCK AI response")
            await asyncio.sleep(1.5)
            return self._get_mock_response(slide_count, text)

        # UI Trick/Prompt Enhancement (Internal rewrite)
        enhanced_input = f"Create an educational and professional presentation on '{text}', covering its definition, core concepts, real-world applications, benefits, and major challenges."
        if len(text) > 50:
             enhanced_input = text # Trust long user prompts

        try:
            # Step 1: Topic Decomposition (Planning Phase)
            concept_plan = await self._plan_topic(enhanced_input, slide_count)
            logger.info(f"Planned Topic: {concept_plan.topic} with {len(concept_plan.sections)} sections")

            # Step 2: Content Expansion (Execution Phase)
            # Parallelize slide generation for speed
            tasks = [self._expand_section(section) for section in concept_plan.sections]
            slides = await asyncio.gather(*tasks)
            
            presentation = PresentationStructure(
                topic=concept_plan.topic,
                slides=slides
            )

            # Step 3: Polish & Validate (Retry layer)
            if self._contains_forbidden_words(presentation):
                logger.warning("Generic content detected. Re-buffering target slides...")
                # Simple retry logic for the whole deck for now (could be per-slide in future)
                tasks = [self._expand_section(section, stricter=True) for section in concept_plan.sections]
                slides = await asyncio.gather(*tasks)
                presentation.slides = slides

            # Final check (Singe slide constraint check)
            if len(presentation.slides) > 15:
                presentation.slides = presentation.slides[:15]
            
            return presentation

        except Exception as e:
            logger.error(f"Gamma Pipeline Error: {e}")
            raise e

    async def _plan_topic(self, text: str, slide_count: int) -> ConceptPlan:
        """Task 1: Break topic into a natural learning flow."""
        prompt = CONCEPT_PLANNER_PROMPT.format(slide_count=slide_count)
        
        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=[
                {"role": "system", "content": "You are a senior curriculum designer. Output valid JSON only."},
                {"role": "user", "content": f"{prompt}\n\nUSER TOPIC:\n\"\"\"{text}\"\"\""}
            ],
            response_format={"type": "json_object"},
            temperature=0.2, # Very low for structural accuracy
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Planner AI failed to return a structure.")
            
        data = json.loads(content)
        return ConceptPlan(**data)

    async def _expand_section(self, section, stricter: bool = False) -> Slide:
        """Task 2: Expand a single planned section into a slide."""
        prompt = SLIDE_CONTENT_PROMPT.format(
            section_title=section.section_title,
            what_to_cover=section.what_to_cover
        )
        
        if stricter:
            prompt += "\n!! CRITICAL: You MUST use deep factual details. AVOID generic phrases like 'Overview', 'Key Aspect', or 'Supporting Evidence'."

        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=[
                {"role": "system", "content": "You are a professional presentation writer. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7, # Higher for rich language
        )
        
        content = response.choices[0].message.content
        if not content:
            return Slide(title=section.section_title, points=["Error generating content for this section."])
            
        data = json.loads(content)
        # Map bullet_points from prompt to points in schema
        return Slide(title=data["title"], points=data["bullet_points"])

    def _contains_forbidden_words(self, presentation: PresentationStructure) -> bool:
        """Checks if generic fluff is present."""
        dump = json.dumps(presentation.model_dump()).lower()
        for word in FORBIDDEN_WORDS:
            if word in dump:
                logger.info(f"Forbidden word match: {word}")
                return True
        return False

    def _get_mock_response(self, slide_count: int, text: str) -> PresentationStructure:
        """Factual-looking mock data."""
        topic = text[:40] + "..." if len(text) > 40 else text
        slides = []
        for i in range(slide_count):
            slides.append({
                "title": f"Structural Component {i+1} for {topic}",
                "points": [f"Deep analysis of {topic} phase {i}", "Contextual integration with core systems", "Comparative evaluation of current models"]
            })
        return PresentationStructure(topic=topic, slides=slides)

content_engine = ContentEngine()
