# --- CORE PIPELINE PROMPTS ---

CONCEPT_PLANNER_PROMPT = """You are an expert educator and presentation planner.

Analyze the topic and create a PowerPoint slide outline.

RULES:
- Create EXACTLY {slide_count} slides
- Each slide must cover a DIFFERENT concept
- Use clear, specific slide titles
- Avoid generic terms like "overview", "phase", "strategy"
- Follow a logical learning order

TOPIC:
{user_topic}

OUTPUT FORMAT (JSON ONLY):
{{
  "slides": [
    {{
      "slide_number": 1,
      "title": "Slide title",
      "focus": "What this slide should explain"
    }}
  ]
}}
"""

SLIDE_CONTENT_PROMPT = """You are a professional presentation writer.

Create content for ONE PowerPoint slide.

SLIDE TITLE:
{slide_title}

SLIDE FOCUS:
{slide_focus}

RULES:
- 3 to 5 bullet points
- Max 12 words per bullet
- Clear and factual
- Beginner-friendly
- No repetition
- No generic phrases

OUTPUT FORMAT (JSON ONLY):
{{
  "title": "string",
  "bullet_points": [
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
