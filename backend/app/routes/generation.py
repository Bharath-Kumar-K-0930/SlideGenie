from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from app.services.content_engine import content_engine

router = APIRouter()

class GenerateRequest(BaseModel):
    text: str
    slide_count: int = 5
    type: Literal["pptx", "pdf"] = "pptx"

@router.post("/generate", tags=["generation"])
async def generate_presentation(payload: GenerateRequest):
    """
    Accepts text and generates the presentation structure (Phase 2).
    Phase 3 will add the actual file generation.
    """
    if len(payload.text) > 2000:
        raise HTTPException(status_code=400, detail="Text too long (max 2000 chars)")
        
    try:
        # Step 1: AI Structure Generation
        structure = await content_engine.generate_structure(payload.text, payload.slide_count)
        
        # Step 2: (Phase 3 Placeholder) Generate File
        # ...
        
        return {
            "status": "success",
            "data": {
                "structure": structure.model_dump(),
                "message": "Structure generated successfully. File generation coming in Phase 3."
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
