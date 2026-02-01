# API Contract

## Base URL
`http://localhost:3000/api` (Local) / `https://your-domain.com/api` (Prod)

## Endpoints

### 1. Generate Presentation
**Endpoint:** `POST /generate`

**Description:** Accepts user text and preferences, processes via AI, generates the file, and returns a downloadable stream or base64 content.

**Request Headers:**
*   `Content-Type: application/json`

**Request Body:**
```json
{
  "text": "The quick brown fox jumps over the lazy dog...", // String, required, 1-2000 chars
  "slideCount": 5, // Integer, optional, default: 5, max: 15
  "type": "pptx" // String, enum: ["pptx", "pdf"], default: "pptx"
}
```

**Response (Success - 200 OK):**
```json
{
  "status": "success",
  "data": {
    "filename": "presentation_1712345678.pptx",
    "contentType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "fileBase64": "UEsDBBQABgAIAAAAIQA..." // Base64 encoded file content
  }
}
```
*Note: Using Base64 allows the frontend to easily trigger a download blob without needing a persistent file storage backend for the MVP.*

**Response (Error - 400 Bad Request):**
```json
{
  "status": "error",
  "message": "Input text exceeds maximum length of 2000 characters."
}
```

**Response (Error - 500 Internal Server Error):**
```json
{
  "status": "error",
  "message": "Failed to generate presentation. AI service unavailable."
}
```
