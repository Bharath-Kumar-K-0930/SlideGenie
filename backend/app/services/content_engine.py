import json
import logging
from typing import Optional, List
import asyncio
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.prompts import CONCEPT_EXTRACTION_PROMPT, FINAL_PPT_SLIDE_PROMPT
from app.schemas.presentation import PresentationStructure, ConceptPlan

# Setup logger
logger = logging.getLogger(__name__)

FORBIDDEN_WORDS = [
    "key aspect",
    "important detail",
    "topic:",
    "supporting evidence",
    "placeholder",
    "insert here",
    "specific detail",
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
        Generates structured JSON content for slides using a 2-step AI chain.
        Step 1: Concept Understanding (Analyze concept & Extract subtopics)
        Step 2: Slide Expansion (Generate detailed content per subtopic)
        """
        # Step 0: Handle MOCK_AI or missing client
        if not self.client or settings.MOCK_AI:
            logger.info("Using MOCK AI response")
            await asyncio.sleep(1.5)
            return self._get_mock_response(slide_count, text)

        # Step 1: Auto-enhance weak input if needed (Slightly improved input internally)
        input_text = text
        if len(text) < 150:
             logger.info("Short input detected, AI will expand internally during concept extraction.")

        try:
            # Step 1: Concept Extraction Phase
            concept_plan = await self._analyze_concept(input_text, slide_count)
            logger.info(f"Analyzed Concept: {concept_plan.main_topic}")

            # Step 2: Slide Generation Phase
            presentation = await self._generate_slides(concept_plan, slide_count)
            
            # Step 3: Backend Validation Guard
            if self._contains_forbidden_words(presentation):
                logger.warning("Forbidden words detected. Retrying with stricter constraints...")
                presentation = await self._generate_slides(concept_plan, slide_count, stricter=True)

            # Final check/cleanup
            if len(presentation.slides) > 15:
                presentation.slides = presentation.slides[:15]
            if len(presentation.slides) < slide_count:
                logger.warning(f"AI returned fewer slides than requested ({len(presentation.slides)}/{slide_count})")
            
            return presentation

        except Exception as e:
            logger.error(f"Generation Chain Error: {e}")
            raise e

    async def _analyze_concept(self, text: str, slide_count: int) -> ConceptPlan:
        """Step 1: Analyzes user input to create a structured plan."""
        prompt = CONCEPT_EXTRACTION_PROMPT.format(slide_count=slide_count)
        
        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo-1106", # Efficient for JSON extraction
            messages=[
                {"role": "system", "content": "You are a senior subject-matter analyst. Output valid JSON only."},
                {"role": "user", "content": f"{prompt}\n\nUSER INPUT:\n\"\"\"{text}\"\"\""}
            ],
            response_format={"type": "json_object"},
            temperature=0.3, # Low temperature for factual analysis
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("AI failed to return any concept analysis.")
            
        data = json.loads(content)
        return ConceptPlan(**data)

    async def _generate_slides(self, plan: ConceptPlan, slide_count: int, stricter: bool = False) -> PresentationStructure:
        """Step 2: Expands the concept plan into full slide content."""
        subtopics_list = "\n".join([f"- {s}" for s in plan.subtopics])
        prompt = FINAL_PPT_SLIDE_PROMPT.format(
            slide_count=slide_count,
            main_topic=plan.main_topic,
            subtopics_list=subtopics_list
        )
        
        if stricter:
            prompt += "\n!! CRITICAL RULES: DO NOT use 'Key Aspect', 'Important Detail', or any other generic headers. Each slide title MUST be specific and unique based on the subtopic."

        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=[
                {"role": "system", "content": "You are a senior presentation designer. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7, # Higher temperature for better writing
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("AI failed to generate slides.")
            
        data = json.loads(content)
        return PresentationStructure(**data)

    def _contains_forbidden_words(self, presentation: PresentationStructure) -> bool:
        """Checks if any generic/forbidden phrases are present in the final output."""
        content_dump = json.dumps(presentation.model_dump()).lower()
        for word in FORBIDDEN_WORDS:
            if word in content_dump:
                logger.info(f"Forbidden word matched: {word}")
                return True
        return False

    def _get_mock_response(self, slide_count: int, text: str) -> PresentationStructure:
        """Fallback mock generator for testing."""
        topic = text[:40] + "..." if len(text) > 40 else text
        slides = [
            {
                "title": f"Introduction to {topic}",
                "points": ["Major industry drivers", "Core conceptual overview", "Scope of the discussion"]
            }
        ]
        
        for i in range(1, slide_count - 1):
            slides.append({
                "title": f"Implementation Strategy {i}",
                "points": [f"Key focus on {topic} optimization", "Resource allocation models", "Performance metrics"]
            })
            
        if slide_count > 1:
            slides.append({
                "title": "Conclusion & Future Path",
                "points": ["Summary of key findings", "Recommendations for action", "Emerging trends to watch"]
            })
            
        return PresentationStructure(topic=topic, slides=slides[:slide_count])

content_engine = ContentEngine()
