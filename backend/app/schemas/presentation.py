from pydantic import BaseModel, Field
from typing import List, Optional

class Slide(BaseModel):
    title: str = Field(description="The title of the slide")
    points: List[str] = Field(description="List of bullet points for the slide", max_length=5)

class PlanSection(BaseModel):
    section_title: str
    what_to_cover: str
    suggest_diagram: Optional[str] = None # e.g. "flowchart", "bar_chart"

class Domain(str):
    GENERAL = "general"
    TECHNICAL = "technical"
    MATHEMATICS = "mathematics"
    LAW = "law"
    MEDICINE = "medicine"

class ConceptPlan(BaseModel):
    topic: str
    sections: List[PlanSection]

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
