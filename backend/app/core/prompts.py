CONCEPT_EXTRACTION_PROMPT = """You are an expert subject-matter analyst.

TASK:
Analyze the user's input and identify the EXACT core topic and its key sub-concepts for a {slide_count}-slide presentation.

RULES:
1. Do NOT generate slides.
2. Do NOT add generic placeholders.
3. Extract only what is logically present or implied in the input.
4. Be specific. Avoid vague terms like "Key Aspect".
5. Output EXACTLY {slide_count} specific subtopics that cover the main topic comprehensively.

OUTPUT FORMAT (STRICT JSON):
{{
  "main_topic": "string",
  "subtopics": [
    "specific subtopic 1",
    "specific subtopic 2",
    "specific subtopic 3"
  ]
}}
"""

FINAL_PPT_SLIDE_PROMPT = """You are a senior presentation designer.

TASK:
Create a PowerPoint presentation using the provided topic and subtopics.

STRICT RULES:
1. Output ONLY valid JSON.
2. NO generic titles like "Key Aspect", "Overview", or "Important Detail".
3. Slide titles MUST directly reflect the subtopic from the input data.
4. Content MUST stay within the given topic.
5. Do NOT invent unrelated concepts.
6. Each bullet point must be factual and specific.
7. Avoid markdown formatting like ```json ... ```.

SLIDE STRUCTURE:
- EXACTLY {slide_count} slides
- Each slide:
  {{
    "title": "clear and specific",
    "points": ["concise point 1", "concise point 2"]
  }}
- Bullet points must be concise (max 12 words per point).

INPUT DATA:
Main Topic: {main_topic}
Subtopics: {subtopics_list}

JSON OUTPUT FORMAT:
{{
  "topic": "{main_topic}",
  "slides": [
    {{
      "title": "string",
      "points": ["string"]
    }}
  ]
}}
"""
