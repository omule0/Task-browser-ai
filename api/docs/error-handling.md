# Error Handling

## Overview
The API implements a standardized error handling mechanism across all endpoints. This document outlines the common error patterns, status codes, and how to handle them in your applications.

## HTTP Status Codes

### 400 Bad Request
Returned when the request is malformed or contains invalid parameters.

**Common scenarios:**
- Invalid request body format
- Missing required fields
- Invalid parameter values
- Malformed JSON

**Example Response:**
```json
{
    "detail": "Invalid request parameters",
    "errors": [
        {
            "field": "task",
            "message": "Field cannot be empty"
        }
    ]
}
```

### 401 Unauthorized
Returned when authentication fails or is missing.

**Common scenarios:**
- Missing JWT token
- Invalid JWT token
- Expired token

**Example Response:**
```json
{
    "detail": "Could not validate credentials",
    "error": "Invalid authentication credentials"
}
```

### 403 Forbidden
Returned when the authenticated user doesn't have sufficient permissions.

**Common scenarios:**
- Attempting to access another user's resources
- Insufficient role permissions

**Example Response:**
```json
{
    "detail": "Not enough permissions",
    "error": "User does not have access to this resource"
}
```

### 404 Not Found
Returned when the requested resource doesn't exist.

**Common scenarios:**
- Invalid history ID
- Non-existent static file
- Invalid endpoint

**Example Response:**
```json
{
    "detail": "Resource not found",
    "error": "History record with ID {id} does not exist"
}
```

### 429 Too Many Requests
Returned when rate limiting is exceeded.

**Example Response:**
```json
{
    "detail": "Too many requests",
    "retry_after": 60
}
```

### 500 Internal Server Error
Returned when an unexpected error occurs on the server.

**Example Response:**
```json
{
    "detail": "Internal server error",
    "error": "An unexpected error occurred"
}
```

## Error Response Structure
All error responses follow a consistent structure:

```json
{
    "detail": "Human-readable error message",
    "error": "Technical error description",
    "errors": [] // Optional array of specific validation errors
}
```

## Handling Browser Task Errors

### Task Execution Errors
During browser task execution, errors are streamed in real-time:

```json
{
    "type": "error",
    "message": "Error description",
    "timestamp": "2024-02-23T12:00:00Z"
}
```

### Common Browser Task Errors
1. **Browser Initialization**
   - Browser failed to start
   - Invalid browser configuration
   - Network connectivity issues

2. **Task Execution**
   - AI model errors
   - Page navigation failures
   - Element interaction failures
   - Timeout errors

3. **Resource Issues**
   - Memory limits exceeded
   - CPU limits exceeded
   - Disk space issues

## Best Practices

### Error Handling
1. Always check the HTTP status code first
2. Parse the error response body for detailed information
3. Implement appropriate retry mechanisms for recoverable errors
4. Log errors with sufficient context for debugging

### Retry Strategy
For certain errors (network issues, rate limiting), implement exponential backoff:
```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === maxRetries - 1) throw err;
            await new Promise(resolve => 
                setTimeout(resolve, Math.pow(2, i) * 1000)
            );
        }
    }
}
```

## Monitoring and Debugging
- All errors are logged with unique correlation IDs
- Use the correlation ID in support requests
- Monitor error rates and patterns through logging system
- Set up alerts for critical error thresholds 