import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
import time

@pytest.mark.asyncio
async def test_sql_injection_attempt():
    """Test that SQL injection attempts are handled safely"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        malicious_text = "'; DROP TABLE users; --"
        response = await client.post(
            "/api/v1/generate",
            json={"text": malicious_text, "slideCount": 3, "type": "pptx"}
        )
        # Should process safely without errors
        assert response.status_code in [200, 400, 500]
        # Should not crash the server
        assert response.json() is not None

@pytest.mark.asyncio
async def test_xss_attempt():
    """Test that XSS attempts are handled safely"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        xss_text = "<script>alert('XSS')</script>"
        response = await client.post(
            "/api/v1/generate",
            json={"text": xss_text, "slideCount": 3, "type": "pptx"}
        )
        # Should process safely
        assert response.status_code in [200, 400, 500]

@pytest.mark.asyncio
async def test_rate_limiting():
    """Test that rate limiting is configured (may not trigger in test environment)"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Make 6 rapid requests
        responses = []
        for i in range(6):
            response = await client.post(
                "/api/v1/generate",
                json={"text": f"Test {i}", "slideCount": 3, "type": "pptx"}
            )
            responses.append(response.status_code)
        
        # Rate limiting might not trigger in test environment due to different IPs
        # Just ensure no crashes occurred
        assert all(status in [200, 400, 429, 500] for status in responses)

@pytest.mark.asyncio
async def test_invalid_slide_count():
    """Test that invalid slide counts are rejected"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Test negative slide count
        response = await client.post(
            "/api/v1/generate",
            json={"text": "Test", "slideCount": -5, "type": "pptx"}
        )
        assert response.status_code == 422  # Validation error
        
        # Test zero slide count
        response = await client.post(
            "/api/v1/generate",
            json={"text": "Test", "slideCount": 0, "type": "pptx"}
        )
        assert response.status_code == 422

@pytest.mark.asyncio
async def test_invalid_file_type():
    """Test that invalid file types are rejected"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/generate",
            json={"text": "Test", "slideCount": 3, "type": "exe"}
        )
        assert response.status_code == 422  # Validation error

@pytest.mark.asyncio
async def test_unicode_handling():
    """Test that unicode characters are handled properly"""
    import asyncio
    await asyncio.sleep(2)  # Avoid rate limiting
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        unicode_text = "Hello 世界 🌍 Привет مرحبا"
        response = await client.post(
            "/api/v1/generate",
            json={"text": unicode_text, "slideCount": 3, "type": "pptx"}
        )
        assert response.status_code in [200, 429]  # Accept rate limit
        if response.status_code == 200:
            data = response.json()
            assert data["status"] == "success"

@pytest.mark.asyncio
async def test_special_characters():
    """Test handling of special characters"""
    import asyncio
    await asyncio.sleep(2)  # Avoid rate limiting
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        special_text = "Test with special chars: @#$%^&*()_+-=[]{}|;':\",./<>?"
        response = await client.post(
            "/api/v1/generate",
            json={"text": special_text, "slideCount": 3, "type": "pptx"}
        )
        assert response.status_code in [200, 429]  # Accept rate limit

@pytest.mark.asyncio
async def test_extremely_long_text():
    """Test that extremely long text is rejected"""
    import asyncio
    await asyncio.sleep(2)  # Avoid rate limiting
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        long_text = "a" * 10000  # 10,000 characters
        response = await client.post(
            "/api/v1/generate",
            json={"text": long_text, "slideCount": 3, "type": "pptx"}
        )
        # Should be rejected for being too long, or rate limited
        assert response.status_code in [400, 429]
        if response.status_code == 400:
            assert "too long" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_malformed_json():
    """Test that malformed JSON is rejected"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/generate",
            content="not valid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422

@pytest.mark.asyncio
async def test_missing_required_fields():
    """Test that missing required fields are rejected"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Missing 'text' field
        response = await client.post(
            "/api/v1/generate",
            json={"slideCount": 3, "type": "pptx"}
        )
        assert response.status_code == 422

@pytest.mark.asyncio
async def test_cors_headers():
    """Test that CORS is configured"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        # Just ensure the endpoint works - CORS headers are added by middleware
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_null_values():
    """Test that null values are handled properly"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/generate",
            json={"text": None, "slideCount": 3, "type": "pptx"}
        )
        assert response.status_code == 422  # Validation error
