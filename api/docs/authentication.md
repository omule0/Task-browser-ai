# Authentication

## Overview
The API uses JWT (JSON Web Token) based authentication in conjunction with user management through Supabase. All API endpoints require valid authentication tokens to access.

## Authentication Flow

### 1. User Authentication
Authentication is handled through Supabase authentication service. The process involves:
1. User signs in through the frontend application
2. Supabase returns access and refresh tokens
3. Tokens are used for subsequent API requests

### 2. Token Structure
The API expects a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### 3. Token Validation
Each request is validated for:
- Token presence
- Token format
- Token expiration
- Token signature
- User permissions

## Token Management

### Access Token
- Short-lived token (1 hour)
- Used for API requests
- Contains user information and permissions

### Refresh Token
- Long-lived token (7 days)
- Used to obtain new access tokens
- Should be securely stored

## User Authentication States

### 1. Authenticated
```json
{
    "user": {
        "id": "string",
        "email": "string",
        "role": "string"
    },
    "tokens": {
        "access_token": "string",
        "refresh_token": "string"
    }
}
```

### 2. Unauthenticated
```json
{
    "detail": "Not authenticated",
    "error": "Missing or invalid authentication credentials"
}
```

## Security Measures

### 1. Token Security
- Tokens are encrypted and signed
- Contains minimal user information
- Short expiration times
- Secure token storage recommendations

### 2. CORS Protection
- Configured allowed origins
- Credential requirements
- Method restrictions

### 3. Rate Limiting
- Per-user rate limits
- IP-based rate limits
- Graduated rate limiting

## Implementation Examples

### Frontend Implementation
```javascript
// Setting up authentication headers
const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
};

// Making authenticated requests
async function makeAuthenticatedRequest(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });
        
        if (response.status === 401) {
            // Handle token refresh
            await refreshToken();
            return makeAuthenticatedRequest(endpoint, options);
        }
        
        return response;
    } catch (error) {
        // Handle errors
        console.error('Request failed:', error);
        throw error;
    }
}
```

### Token Refresh
```javascript
async function refreshToken() {
    try {
        const response = await fetch('/auth/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const { access_token } = await response.json();
            // Update stored access token
            updateAccessToken(access_token);
        } else {
            // Handle refresh failure
            redirectToLogin();
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        redirectToLogin();
    }
}
```

## Best Practices

### 1. Token Storage
- Store tokens in secure HTTP-only cookies
- Never store in localStorage or sessionStorage
- Clear tokens on logout

### 2. Error Handling
- Implement token refresh logic
- Handle authentication failures gracefully
- Provide clear error messages

### 3. Security Guidelines
- Use HTTPS for all requests
- Implement proper CORS policies
- Regular security audits
- Monitor for suspicious activities

## Common Issues and Solutions

### 1. Token Expiration
- Implement automatic token refresh
- Handle expired token errors
- Maintain user session

### 2. Cross-Origin Requests
- Configure CORS properly
- Handle preflight requests
- Secure credential handling

### 3. Token Invalidation
- Implement proper logout
- Handle token revocation
- Clear client-side storage 