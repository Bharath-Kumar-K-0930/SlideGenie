from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Literal
import base64
from app.services.content_engine import content_engine
from app.services.ppt_generator import ppt_generator
from app.services.pdf_generator import pdf_generator
from app.core.limiter import limiter

router = APIRouter()


class GenerateRequest(BaseModel):
    text: str
    slide_count: int = 5
    type: Literal["pptx", "pdf"] = "pptx"

@router.post("/generate", tags=["generation"])
@limiter.limit("5/minute")
async def generate_presentation(request: Request, payload: GenerateRequest):
    """
    Accepts text and generates the presentation structure + output file.
    Rate Limit: 5 requests per minute per IP.
    """
    from app.utils.logger import log_request, log_error
    import time
    
    start_time = time.time()
    
    if len(payload.text) > 2000:
        log_request("/generate", "rejected_too_long", 0)
        raise HTTPException(status_code=400, detail="Text too long (max 2000 chars)")
        
    try:
        # Step 1: AI Structure Generation
        structure = await content_engine.generate_structure(payload.text, payload.slide_count)
        
        # Step 2: Generate File
        # Offload CPU-bound work to threadpool to avoid blocking async event loop
        import asyncio
        
        file_buffer = None
        filename = "presentation.pptx"
        content_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"

        if payload.type == "pdf":
            filename = "presentation.pdf"
            content_type = "application/pdf"
            file_buffer = await asyncio.to_thread(pdf_generator.generate, structure)
        else:
            # Default to PPTX
            filename = "presentation.pptx"
            content_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            file_buffer = await asyncio.to_thread(ppt_generator.generate, structure)
        
        # Step 3: Encode to Base64
        file_base64 = base64.b64encode(file_buffer.getvalue()).decode('utf-8')
        
        duration_ms = (time.time() - start_time) * 1000
        log_request("/generate", "success", duration_ms)
        
        return {
            "status": "success",
            "data": {
                "filename": filename,
                "contentType": content_type,
                "fileBase64": file_base64,
                "structure": structure.model_dump() # Optional: return structure for debug/preview
            }
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        log_error(e, "generate_presentation")
        duration_ms = (time.time() - start_time) * 1000
        log_request("/generate", "error", duration_ms)
        raise HTTPException(status_code=500, detail=str(e))
