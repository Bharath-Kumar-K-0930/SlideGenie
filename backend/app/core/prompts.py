CONCEPT_PLANNER_PROMPT = """You are a subject-matter expert and curriculum designer.

TASK:
Break the given topic into a clear, logical presentation outline suitable for a {slide_count}-slide PowerPoint presentation.

RULES:
1. Do NOT generate slide content.
2. Do NOT use generic terms like "Key Aspect", "Overview", or "Implementation Strategy".
3. Each section must be specific and directly related to the topic.
4. The outline must follow a natural learning flow.
5. Provide EXACTLY {slide_count} sections.

OUTPUT FORMAT (STRICT JSON):
{{
  "topic": "string",
  "sections": [
    {{
      "section_title": "string",
      "what_to_cover": "1–2 sentence description of specific facts and details to include"
    }}
  ]
}}
"""

SLIDE_CONTENT_PROMPT = """You are a professional presentation writer.

TASK:
Create PowerPoint slide content for the following section.

RULES:
1. Output ONLY valid JSON.
2. Slide title must match the section title exactly.
3. Bullet points must be factual, specific, and non-generic.
4. Each bullet point: max 12 words.
5. No filler text. No vague phrases like "Important detail" or "Learn more".
6. Avoid markdown formatting like ```json ... ```.

SECTION TITLE:
{section_title}

WHAT TO COVER:
{what_to_cover}

OUTPUT FORMAT (STRICT JSON):
{{
  "title": "{section_title}",
  "bullet_points": [
    "string",
    "string",
    "string"
  ]
}}
"""
