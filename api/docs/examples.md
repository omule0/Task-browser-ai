# API Usage Examples

This document provides practical examples of using the Digest AI API in different programming languages and scenarios.

## Browser Task Examples

### 1. Simple Web Scraping Task

#### Request
```python
import requests

headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

data = {
    "task": "Visit digestafrica.com and extract all company names from the homepage",
    "model": "gpt-4o-mini"
}

response = requests.post(
    'https://api.digestafrica.com/api/browser-task',
    headers=headers,
    json=data
)
```

#### Response Stream
```json
{
  "type": "info",
  "message": "Browser initialized successfully"
}
{
  "type": "progress",
  "message": "Visiting digestafrica.com..."
}
{
  "type": "success",
  "message": "Extracted company names: [...]"
}
```

### 2. Complex Task with Sensitive Data

#### Request
```typescript
const response = await fetch('https://api.digestafrica.com/api/browser-task', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    task: "Log into my account and download the latest report",
    model: "gpt-4o-mini",
    sensitive_data: {
      username: "user@example.com",
      password: "********"
    },
    email: "notify@example.com"
  })
});
```

## History Management Examples

### 1. Fetch Recent History

#### Request
```python
response = requests.get(
    'https://api.digestafrica.com/api/history',
    headers=headers,
    params={'limit': 5, 'offset': 0}
)
```

#### Response
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "user123",
    "task": "Web scraping task",
    "progress": [
      {
        "type": "info",
        "message": "Task started",
        "timestamp": "2024-02-23T12:00:00Z"
      },
      {
        "type": "success",
        "message": "Task completed",
        "timestamp": "2024-02-23T12:01:00Z"
      }
    ],
    "result": "Successfully extracted data",
    "created_at": "2024-02-23T12:00:00Z"
  }
]
```

### 2. Get Task Details with GIF

#### Request
```javascript
const response = await fetch(`https://api.digestafrica.com/api/history/${historyId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();
const gifContent = data.gif_content;
```

### 3. Delete History Entry

#### Request
```python
response = requests.delete(
    f'https://api.digestafrica.com/api/history/{history_id}',
    headers=headers
)
```

## Error Handling Examples

### 1. Rate Limit Handling

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### 2. Authentication Error Handling

```javascript
async function authenticatedRequest(url, options) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${getAccessToken()}`
      }
    });

    if (response.status === 401) {
      await refreshToken();
      return authenticatedRequest(url, options);
    }

    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

## WebSocket/SSE Examples

### 1. Handling Server-Sent Events

```javascript
const eventSource = new EventSource(
  'https://api.digestafrica.com/api/browser-task',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`Progress: ${data.message}`);
};

eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
  eventSource.close();
};
```

## Integration Examples

### 1. React Component

```tsx
import { useState, useEffect } from 'react';

const TaskHistory: React.FC = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('https://api.digestafrica.com/api/history', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch history');
        
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {history.map(entry => (
            <li key={entry.id}>
              {entry.task} - {entry.created_at}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskHistory;
``` 