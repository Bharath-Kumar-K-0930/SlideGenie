import pytest
from app.services.ppt_generator import ppt_generator
from app.services.pdf_generator import pdf_generator
from app.schemas.presentation import PresentationStructure

@pytest.fixture
def sample_structure():
    """Sample presentation structure for testing"""
    return PresentationStructure(
        topic="Test Presentation",
        slides=[
            {
                "title": "Introduction",
                "points": ["Point 1", "Point 2", "Point 3"]
            },
            {
                "title": "Conclusion",
                "points": ["Summary point"]
            }
        ]
    )

def test_ppt_generation(sample_structure):
    """Test that PPT generator creates a valid file"""
    result = ppt_generator.generate(sample_structure)
    assert result is not None
    assert result.getbuffer().nbytes > 0  # File has content

def test_pdf_generation(sample_structure):
    """Test that PDF generator creates a valid file"""
    result = pdf_generator.generate(sample_structure)
    assert result is not None
    assert result.getbuffer().nbytes > 0  # File has content

def test_ppt_with_many_slides():
    """Test PPT generation with maximum slides"""
    slides = [
        {"title": f"Slide {i}", "points": [f"Point {j}" for j in range(5)]}
        for i in range(15)
    ]
    structure = PresentationStructure(topic="Large Presentation", slides=slides)
    result = ppt_generator.generate(structure)
    assert result.getbuffer().nbytes > 0

def test_pdf_with_many_slides():
    """Test PDF generation with maximum slides"""
    slides = [
        {"title": f"Slide {i}", "points": [f"Point {j}" for j in range(5)]}
        for i in range(15)
    ]
    structure = PresentationStructure(topic="Large Document", slides=slides)
    result = pdf_generator.generate(structure)
    assert result.getbuffer().nbytes > 0
