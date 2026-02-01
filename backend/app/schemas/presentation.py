from pydantic import BaseModel, Field
from typing import List

class Slide(BaseModel):
    title: str = Field(description="The title of the slide")
    points: List[str] = Field(description="List of bullet points for the slide", max_length=5)

class PresentationStructure(BaseModel):
    topic: str = Field(description="The main topic of the presentation")
    slides: List[Slide] = Field(description="List of slides in the presentation")

    class Config:
        json_schema_extra = {
            "example": {
                "topic": "The Future of AI",
                "slides": [
                    {
                        "title": "Introduction to AI",
                        "points": ["Definition of Artificial Intelligence", "History and Evolution", "Current State of Technology"]
                    }
                ]
            }
        }
