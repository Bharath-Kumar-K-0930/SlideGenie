from typing import List

class Validator:
    FORBIDDEN_WORDS = [
        "overview",
        "key aspect",
        "important detail",
        "implementation strategy",
        "optimization",
        "performance metrics",
        "placeholder",
        "supporting evidence",
        "generic concept",
        "learn more",
        "specific detail"
    ]

    @classmethod
    def is_valid_slide(cls, slide_json: dict) -> bool:
        """Stage 3: The Validator"""
        # Check both title and bullet points
        text = (slide_json.get("title", "") + " " + " ".join(slide_json.get("bullet_points", []))).lower()
        return not any(word in text for word in cls.FORBIDDEN_WORDS)
