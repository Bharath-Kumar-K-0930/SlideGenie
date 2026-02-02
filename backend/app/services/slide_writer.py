import json
from openai import AsyncOpenAI
from app.core.prompts import SLIDE_CONTENT_PROMPT

class SlideWriter:
    def __init__(self, client: AsyncOpenAI):
        self.client = client

    async def generate_slide(self, section_title: str, what_to_cover: str, domain_rules: str = "", is_retry: bool = False):
        prompt = SLIDE_CONTENT_PROMPT.format(
            section_title=section_title,
            what_to_cover=what_to_cover,
            domain_rules=domain_rules
        )
        
        if is_retry:
            prompt += "\n\n!! CRITICAL: Your previous output was too generic. You MUST use hard facts, specific data, and unique insights. AVOID ALL FILTER WORDS like 'Key Aspect', 'Overview', etc."

        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional presentation architect. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.4 if is_retry else 0.3,
        )

        return response.choices[0].message.content
