# SlideGenie AI

AI-Powered Text → PPT & PDF Generator

## Architecture

    Client[Next.js Client] -->|Type: PPT/PDF| API[FastAPI Backend]
    API -->|Input Text| Logic{Backend Logic}
    Logic -->|Prompt| LLM[AI Service]
    LLM -->|JSON Structure| Logic
    Logic -->|Generate| PPT[PPTXGenJS/Python-PPTX]
    Logic -->|Generate| PDF[PDFKit]
    PPT --> Client
    PDF --> Client
```

## Features (Phase 0 Design)
*   **Text to Presentation:** Instantly convert text blocks into structured slides.
*   **Multi-Format:** Support for both PowerPoint (.pptx) and PDF formats.
*   **Smart Summarization:** AI-driven content extraction and bullet-point generation.
*   **Customizable:** User-defined slide count (up to 15).

## Tech Stack
*   **Frontend:** Next.js 14, Tailwind CSS, TypeScript
*   **Backend:** FastAPI (Python), Pydantic
*   **AI:** LLM Integration (DeepSeek/OpenAI/Gemini - TBD)
*   **Docs:** PDFKit, Python-PPTX

## Structure

*   `frontend/`: Next.js 14 + Tailwind CSS
*   `backend/`: FastAPI + Python

## Setup

### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Health Check
Backend: `http://localhost:8000/api/v1/health`
Frontend: `http://localhost:3000`
