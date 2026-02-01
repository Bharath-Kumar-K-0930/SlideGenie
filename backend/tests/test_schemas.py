import pytest
from app.schemas.presentation import PresentationStructure, Slide

def test_valid_presentation_structure():
    """Test that valid presentation structure is accepted"""
    data = {
        "topic": "Test Topic",
        "slides": [
            {
                "title": "Slide 1",
                "points": ["Point 1", "Point 2", "Point 3"]
            }
        ]
    }
    presentation = PresentationStructure(**data)
    assert presentation.topic == "Test Topic"
    assert len(presentation.slides) == 1
    assert presentation.slides[0].title == "Slide 1"

def test_slide_points_limit():
    """Test that slides accept up to 5 points"""
    slide_data = {
        "title": "Test Slide",
        "points": ["P1", "P2", "P3", "P4", "P5"]
    }
    slide = Slide(**slide_data)
    assert len(slide.points) == 5

def test_empty_slides_allowed():
    """Test that empty slides list is technically allowed by schema (validation happens at API level)"""
    presentation = PresentationStructure(topic="Test", slides=[])
    assert len(presentation.slides) == 0
