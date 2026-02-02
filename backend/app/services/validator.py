from typing import List
from openai import AsyncOpenAI
from app.core.prompts import SLIDE_SCORER_PROMPT
import json
import logging

logger = logging.getLogger(__name__)

class Validator:
    FORBIDDEN_WORDS = [
        "overview",
        "key aspect",
        "important detail",
        "implementation strategy",
        "optimization",
        "performance metrics",
        "placeholder",
        "supporting evidence",
        "generic concept",
        "learn more",
        "specific detail",
        "vague detail"
    ]

    @classmethod
    def is_valid_slide_text(cls, title: str, points: List[str]) -> bool:
        """Stage 3a: Basic keyword filtering"""
        text = (title + " " + " ".join(points)).lower()
        return not any(word in text for word in cls.FORBIDDEN_WORDS)

    @classmethod
    async def get_confidence_score(cls, client: AsyncOpenAI, title: str, points: List[str]) -> int:
        """Stage 3b: AI-based quality scoring"""
        try:
            prompt = SLIDE_SCORER_PROMPT.format(
                title=title,
                points=", ".join(points)
            )
            
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            
            data = json.loads(response.choices[0].message.content)
            return data.get("confidence_score", 0)
        except Exception as e:
            logger.error(f"Scoring error: {e}")
            return 100 # Default to pass on failure to not block
