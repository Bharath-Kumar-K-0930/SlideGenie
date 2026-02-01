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

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Backend (Render/Railway):**
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Frontend (Vercel):**
- Framework: Next.js
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `.next`

### Environment Variables

**Backend:**
```
OPENAI_API_KEY=your_key_here
PROJECT_NAME=SlideGenie AI
VERSION=1.0.0
```

**Frontend:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
```

## Testing

Run backend tests:
```bash
cd backend
python -m pytest tests -v
```

## Project Status

✅ **Phase 0-9 Complete** - Production Ready
- ✅ Design & Architecture
- ✅ Tech Stack Setup
- ✅ AI Content Engine
- ✅ PPT/PDF Generation
- ✅ Frontend UI/UX
- ✅ API Integration
- ✅ Security & Rate Limiting
- ✅ Testing & QA (11/11 tests passing)
- ✅ Deployment Ready

## Post-MVP Enhancements

See [POST_MVP_ENHANCEMENTS.md](POST_MVP_ENHANCEMENTS.md) for detailed future roadmap.

**Planned Features:**
- 🌍 Multi-language support (Spanish, French, German, Hindi, etc.)
- 📄 DOCX upload & parsing
- 🎨 Custom themes and templates
- 👥 Collaboration features
- 🖼️ AI image generation
- 📊 Chart/graph generation

## Senior Developer Principles

### 1. Phase Isolation is Power
```
AI Logic → JSON Contract → File Builder
(Never mix AI with UI or file generation)
```

### 2. Never Mix AI Logic with UI
```
✅ Good: UI → API → AI Service → JSON → Builder
❌ Bad: UI → AI (directly)
```

### 3. JSON is Your Contract
The JSON schema between AI and builders is sacred - it allows:
- Swapping AI providers easily
- Adding new output formats
- Independent testing
- Clear separation of concerns

### 4. Quality > Number of Features
- 1 feature that works perfectly > 10 buggy features
- Focus on reliability, testing, and user experience
- Ship, learn, iterate

## Contributing

Contributions are welcome! Please read the architecture principles in [POST_MVP_ENHANCEMENTS.md](POST_MVP_ENHANCEMENTS.md) before contributing.

## License

MIT

---

**Built with ❤️ following senior developer best practices**
