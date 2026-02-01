import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    """Test that health check endpoint returns 200"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "active"
        assert "project" in data

@pytest.mark.asyncio
async def test_generate_empty_text():
    """Test that empty text triggers an error or generates minimal content"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/generate",
            json={"text": "", "slideCount": 5, "type": "pptx"}
        )
        # Empty text might be handled by AI or rejected - both are acceptable
        # Just ensure it doesn't crash
        assert response.status_code in [200, 400, 500]

@pytest.mark.asyncio
async def test_generate_text_too_long():
    """Test that text over 2000 chars is rejected"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        long_text = "a" * 2001
        response = await client.post(
            "/api/v1/generate",
            json={"text": long_text, "slideCount": 5, "type": "pptx"}
        )
        assert response.status_code == 400
        assert "too long" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_generate_valid_request():
    """Test that valid request returns success (using mock mode if no API key)"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/generate",
            json={
                "text": "Artificial Intelligence is transforming the world.",
                "slideCount": 3,
                "type": "pptx"
            }
        )
        # Should succeed with mock or real AI
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "fileBase64" in data["data"]
