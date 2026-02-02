import json
import logging
from openai import AsyncOpenAI
from typing import List, Dict

logger = logging.getLogger(__name__)

class DiagramPlanner:
    def __init__(self, client: AsyncOpenAI):
        self.client = client

    async def suggest_diagrams(self, topic: str) -> List[Dict]:
        """
        AI decides WHAT diagrams are needed for the presentation.
        """
        prompt = f"""
        You are a presentation strategist.
        Suggest specific diagrams for the following presentation topic to make it professional and visual.

        RULES:
        - Return ONLY valid JSON.
        - Diagrams can be: flowchart, bar_chart, pie_chart, timeline.
        - Only suggest 1-2 most critical diagrams.

        TOPIC:
        {topic}

        OUTPUT FORMAT (STRICT JSON):
        {{
          "diagrams": [
            {{
              "slide_title": "string",
              "type": "flowchart | bar_chart | pie_chart | timeline",
              "description": "Short technical description of what the visual should represent"
            }}
          ]
        }}
        """

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            data = json.loads(response.choices[0].message.content)
            return data.get("diagrams", [])
        except Exception as e:
            logger.error(f"Diagram planning error: {e}")
            return []
