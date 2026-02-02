from openai import AsyncOpenAI
from app.core.config import settings
from app.core.prompts import PROMPT_IMPROVER_PROMPT

class PromptImprover:
    def __init__(self, client: AsyncOpenAI):
        self.client = client

    async def improve_prompt(self, raw_input: str) -> str:
        """
        GAMMA-STYLE: Silently fixes bad user input for higher quality results.
        """
        if not self.client or settings.MOCK_AI:
            return f"Create a comprehensive and educational presentation on '{raw_input}', including its core definition, key historical development, modern real-world applications, major technical benefits, and a discussion of contemporary ethical challenges."
            
        try:
            prompt = PROMPT_IMPROVER_PROMPT.format(user_input=raw_input)
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            return response.choices[0].message.content.strip()
        except Exception:
            return raw_input
