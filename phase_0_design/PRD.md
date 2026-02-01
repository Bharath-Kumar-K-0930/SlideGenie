# Product Requirements Document (PRD)
## Project: SlideGenie AI (Phase 0)

### 1. Introduction
**Goal:** Build an AI-powered tool that converts user-provided text into a downloadable PowerPoint (PPT) or PDF presentation.
**Phase:** 0 — Product & System Design (Foundation Phase)

### 2. User Stories
*   **Story 1:** As a user, I can enter a block of text (topic, notes, article) into an input field.
*   **Story 2:** As a user, I can specify the desired number of slides (up to a maximum limit).
*   **Story 3:** As a user, I can click a "Generate" button to trigger the creation process.
*   **Story 4:** As a user, I can download the generated output as either a PowerPoint (.pptx) file or a PDF (.pdf).

### 3. System Constraints
*   **Input Limits:** 
    *   Maximum text length: 2,000 characters.
    *   Language: English only (for MVP).
*   **Output Limits:**
    *   Maximum 15 slides per presentation.
*   **Architecture:**
    *   Client-Server model.
    *   AI processing must happen on the Backend (Server-side) to secure API keys.
    *   No client-side LLM calls.

### 4. Design & Tone Guidelines
*   **Tone:** Professional, clear, and concise.
*   **Visual Structure:**
    *   Consistent H1 headings for each slide.
    *   Bullet points for content (Max 5 bullets per slide).
    *   Clean, readable layout.

### 5. Exit Criteria
*   [x] Clear scope defined.
*   [x] No feature ambiguity.
*   [x] Architecture selected.
