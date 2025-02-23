# API Endpoints Documentation

## Base URL
- Development: `http://localhost:8000`
- Production: `https://ai.digestafrica.com`

## Available Endpoints

### Root Endpoint
```
GET /
```
Health check endpoint that returns the API status.

### Browser Task Execution
```
POST /api/browse
```
Execute a browser automation task with AI assistance.

**Request Body:**
```json
{
    "task": "string",
    "model": "string" (optional, default: "gpt-4o-mini"),
    "sensitive_data": {
        "key": "value"
    } (optional),
    "email": "string" (optional)
}
```

**Response:**
- Streams real-time progress updates
- Creates a GIF recording of the task execution
- Sends email notification upon completion (if email provided)

### History Management

#### Get Task History
```
GET /api/history
```
Retrieve a list of historical task executions.

**Query Parameters:**
- `limit` (integer, default: 10): Number of records to return
- `offset` (integer, default: 0): Number of records to skip

**Response:**
```json
{
    "items": [
        {
            "id": "string",
            "task": "string",
            "result": "string",
            "error": "string",
            "created_at": "string",
            "progress": []
        }
    ],
    "total": "integer"
}
```

#### Get Specific Task Details
```
GET /api/history/{history_id}
```
Retrieve detailed information about a specific task execution.

**Path Parameters:**
- `history_id` (string): Unique identifier of the task execution

**Response:**
```json
{
    "id": "string",
    "task": "string",
    "result": "string",
    "error": "string",
    "created_at": "string",
    "progress": [
        {
            "timestamp": "string",
            "message": "string",
            "type": "string"
        }
    ],
    "gif_url": "string"
}
```

#### Delete Task History
```
DELETE /api/history/{history_id}
```
Delete a specific task execution record.

**Path Parameters:**
- `history_id` (string): Unique identifier of the task execution

**Response:**
```json
{
    "message": "History record deleted successfully"
}
```

### Static Files
```
GET /static/{file_path}
```
Serve static files (including generated GIFs and other assets).

## Authentication
All endpoints require authentication via JWT token. The token should be included in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Responses
All endpoints may return the following error responses:
- 400 Bad Request: Invalid request parameters
- 401 Unauthorized: Missing or invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Requested resource not found
- 500 Internal Server Error: Server-side error

For detailed error handling information, refer to [Error Handling](error-handling.md). 