import json
import logging
from typing import Optional
import asyncio
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.prompts import SYSTEM_PROMPT
from app.schemas.presentation import PresentationStructure

# Setup logger
logger = logging.getLogger(__name__)

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
        Generates structured JSON content for slides using AI.
        Includes retry logic for malformed JSON and schema validation.
        """
        if not self.client:
             # Fallback or Mock for testing without API Key
            logger.info("Using MOCK AI response (No API Key)")
            await asyncio.sleep(1) # Simulate delay
            return self._get_mock_response(slide_count)

        prompt = f"{SYSTEM_PROMPT.format(slide_count=slide_count)}\n\n{text}"
        
        retries = 3
        for attempt in range(retries):
            try:
                response = await self.client.chat.completions.create(
                    model="gpt-3.5-turbo-1106", # Efficient model with JSON mode support
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.7,
                )

                content = response.choices[0].message.content
                if not content:
                    raise ValueError("Empty response from AI")

                # Parse JSON
                data = json.loads(content)
                
                # Validate against Pydantic Schema
                presentation = PresentationStructure(**data)
                
                # Double check slide count constraint (soft check)
                if len(presentation.slides) > 15:
                     presentation.slides = presentation.slides[:15]
                
                return presentation

            except json.JSONDecodeError as e:
                logger.error(f"JSON Parse Error (Attempt {attempt+1}/{retries}): {e}")
                continue # Retry
            except Exception as e:
                logger.error(f"AI Generation Error (Attempt {attempt+1}/{retries}): {e}")
                if attempt == retries - 1:
                    raise e
        
        raise ValueError("Failed to generate valid presentation structure after retries.")

    def _get_mock_response(self, slide_count: int) -> PresentationStructure:
        slides = []
        for i in range(slide_count):
            slides.append({
                "title": f"Mock Slide {i+1}",
                "points": ["Point 1", "Point 2", "Point 3"]
            })
        return PresentationStructure(topic="Mock Presentation", slides=slides)

content_engine = ContentEngine()
