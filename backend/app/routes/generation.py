from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
import base64
from app.services.content_engine import content_engine
from app.services.ppt_generator import ppt_generator

router = APIRouter()

class GenerateRequest(BaseModel):
    text: str
    slide_count: int = 5
    type: Literal["pptx", "pdf"] = "pptx"

@router.post("/generate", tags=["generation"])
async def generate_presentation(payload: GenerateRequest):
    """
    Accepts text and generates the presentation structure + output file.
    """
    if len(payload.text) > 2000:
        raise HTTPException(status_code=400, detail="Text too long (max 2000 chars)")
        
    try:
        # Step 1: AI Structure Generation
        structure = await content_engine.generate_structure(payload.text, payload.slide_count)
        
        # Step 2: Generate File
        file_buffer = None
        filename = "presentation.pptx"
        content_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"

        if payload.type == "pptx":
            file_buffer = ppt_generator.generate(structure)
        else:
            # Placeholder for PDF (Phase 4)
            # For now, default to PPTX logic or throw not implemented
            # But let's fallback to PPTX for safety in Phase 3
            file_buffer = ppt_generator.generate(structure)
        
        # Step 3: Encode to Base64
        file_base64 = base64.b64encode(file_buffer.getvalue()).decode('utf-8')
        
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
        raise HTTPException(status_code=500, detail=str(e))
