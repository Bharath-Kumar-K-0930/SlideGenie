# Prompt Strategy Draft

## Core Philosophy
We treat the LLM not as a specific file generator, but as a **Structure Extractor**. The LLM's job is to analyze the unstructured input text and return a strictly structured JSON object representing the presentation flow. The backend logic (code) will then take this JSON and render the actual .pptx/.pdf file using a library (e.g., `pptxgenjs` or `pdfkit`).

## Prompt Engineering

### Role Definition
> "You are an expert content strategist and presentation designer. Your goal is to synthesize unstructured text into a clear, concise, and professional slide deck structure."

### Input Structure
The prompt will receive:
1.  **User Content:** The raw text provided by the user.
2.  **Constraints:**
    *   Target Slide Count: `N`
    *   Tone: Professional

### Output Format (Strict JSON)
We will enforce a JSON response to ensure the backend can reliably parse the data.

```json
{
  "presentationTitle": "Derived Title from Content",
  "slides": [
    {
      "slideNumber": 1,
      "layout": "TitleSlide",
      "heading": "Main Presentation Title",
      "subHeading": "Subtitle or Presenter Name"
    },
    {
      "slideNumber": 2,
      "layout": "Content",
      "heading": "Key Topic 1",
      "bulletPoints": [
        "Concise point 1 (max 15 words)",
        "Concise point 2",
        "Concise point 3"
      ]
    }
  ]
}
```

### System Instructions (Draft)
```text
You are to act as a Presentation Architect.
Analyze the following input text and transform it into a slideshow structure.

Constraints:
1. Create exactly {slideCount} slides.
2. formatting: Return ONLY valid JSON. No markdown, no preambles.
3. Content: 
   - Summarize the input text into key points.
   - Limit each slide to a maximum of 5 bullet points.
   - Limit each bullet point to a maximum of 20 words.
   - Ensure headings are consistent and professional.
4. If the input text is too short for the requested slides, expand on the concepts reasonably.
5. If the input text is too long, strictly prioritize the most important information.

Input Text:
"""
{userInputText}
"""
```

## Failure Handling
*   **Validation:** The backend will validate the JSON structure. If `JSON.parse` fails, we retry with a "Fix JSON" prompt.
*   **Fallback:** If the AI generates >5 bullets, the backend code will slice the array to the first 5 items to strictly enforce the requirement.
