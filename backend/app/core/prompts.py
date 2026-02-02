# --- CORE PIPELINE PROMPTS ---

CONCEPT_PLANNER_PROMPT = """You are a subject-matter expert and curriculum designer.

TASK:
Break the given topic into a clear, logical presentation outline suitable for a {slide_count}-slide PowerPoint presentation.

RULES:
1. Do NOT generate slide content.
2. Do NOT use generic terms like "Key Aspect", "Overview", or "Implementation Strategy".
3. Each section must be specific and directly related to the topic.
4. The outline must follow a natural learning flow.
5. Provide EXACTLY {slide_count} sections.
6. For each section, suggest if a visual element (flowchart, bar_chart, pie_chart, timeline) would be beneficial.

OUTPUT FORMAT (STRICT JSON):
{{
  "topic": "string",
  "sections": [
    {{
      "section_title": "string",
      "what_to_cover": "1–2 sentence description of specific facts and details to include",
      "suggest_diagram": "flowchart | bar_chart | pie_chart | timeline | null"
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
{domain_rules}

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

# --- DOMAIN SPECIFIC RULES ---

DOMAIN_RULES = {
    "mathematics": "Rules: Focus on definitions, formulas, and step-by-step logic. Include examples where applicable. No business language.",
    "law": "Rules: Include legal definitions and principles. Mention acts, sections, or doctrines if relevant. Maintain formal legal tone.",
    "medicine": "Rules: Use medically accurate terminology. Focus on mechanisms, causes, symptoms, and prevention. Maintain neutral and ethical tone.",
    "technical": "Rules: Focus on hardware/software mechanisms, architecture, and precise data. Use formal terminology.",
    "general": "Rules: Avoid heavy jargon. Use real-world analogies and clear, engaging descriptions."
}

# --- QUALITY CONTROL PROMPTS ---

SLIDE_SCORER_PROMPT = """You are a senior presentation quality evaluator.

TASK:
Evaluate the following slide content for relevance, specificity, and factual depth.

Score from 0 to 100 base on:
- Relevance to the overall topic (0-40)
- Specificity of the content (No generic filler like "Key Aspect") (0-40)
- Conciseness and Professionalism (0-20)

OUTPUT FORMAT (STRICT JSON):
{{
  "confidence_score": integer
}}

SLIDE DATA:
Title: {title}
Content: {points}
"""

# --- UTILITY PROMPTS ---

PROMPT_IMPROVER_PROMPT = """You are an expert prompt engineer.

TASK:
Rewrite the user's raw input into a clear, structured presentation request.

RULES:
- Keep the original intent and topic.
- Add professional scope and clarity.
- Limit to 20-40 words.
- Do NOT add new unrelated topics.
- Focus on making it educational and comprehensive.

USER INPUT:
\"\"\"{user_input}\"\"\"

OUTPUT FORMAT:
Return only the improved text as a string. No JSON, no intro.
"""
