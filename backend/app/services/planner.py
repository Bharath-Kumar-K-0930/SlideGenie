import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.prompts import CONCEPT_PLANNER_PROMPT

class Planner:
    def __init__(self, client: AsyncOpenAI):
        self.client = client

    async def generate_outline(self, user_prompt: str, slide_count: int):
        prompt = CONCEPT_PLANNER_PROMPT.format(slide_count=slide_count, user_topic=user_prompt)
        
        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a senior subject-matter strategist. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )

        return response.choices[0].message.content
