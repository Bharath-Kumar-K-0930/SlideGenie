from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Literal
import base64
from app.services.content_engine import content_engine
from app.services.ppt_generator import ppt_generator
from app.services.pdf_generator import pdf_generator
from app.core.limiter import limiter

router = APIRouter()


class GenerateRequest(BaseModel):
    text: str
    slideCount: int = Field(default=5, ge=1, le=15)  # Between 1 and 15
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
        structure = await content_engine.generate_structure(payload.text, payload.slideCount)
        
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
        
        # Determine status code and message
        status_code = 500
        error_msg = str(e)
        
        # Better error messages for OpenAI
        if "insufficient_quota" in error_msg:
            status_code = 402 # Payment Required or just 429
            error_msg = "OpenAI API Quota exceeded. Please check your billing/usage."
        elif "rate_limit" in error_msg.lower():
            status_code = 429
            error_msg = "OpenAI Rate limit reached. Try again in a moment."
        elif "api_key" in error_msg.lower():
            status_code = 401
            error_msg = "Invalid or missing OpenAI API Key."
            
        log_error(e, "generate_presentation")
        duration_ms = (time.time() - start_time) * 1000
        log_request("/generate", "error", duration_ms)
        raise HTTPException(status_code=status_code, detail=error_msg)
