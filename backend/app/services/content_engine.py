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
        if not self.client or settings.MOCK_AI:
            # Fallback or Mock for testing without API Key or if forced
            logger.info("Using MOCK AI response")
            await asyncio.sleep(1.5) # Simulate AI thinking delay
            return self._get_mock_response(slide_count, text)

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

    def _get_mock_response(self, slide_count: int, topic: str) -> PresentationStructure:
        # Use first 30 chars of text as topic if not provided
        display_topic = (topic[:30] + '...') if len(topic) > 30 else topic
        
        slides = [
            {
                "title": f"Introduction: {display_topic}",
                "points": ["Overview of the topic", "Key objectives", "Target audience"]
            }
        ]
        
        for i in range(1, slide_count - 1):
            slides.append({
                "title": f"Key Aspect {i}: {display_topic}",
                "points": [f"Important detail about {display_topic}", "Supporting evidence", "Statistical data"]
            })
            
        if slide_count > 1:
            slides.append({
                "title": "Conclusion & Summary",
                "points": ["Final thoughts", "Call to action", "Future outlook"]
            })
            
        return PresentationStructure(topic=display_topic, slides=slides[:slide_count])

content_engine = ContentEngine()
