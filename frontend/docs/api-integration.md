# API Integration

This document outlines how the frontend application integrates with external services.

## Overview

The frontend communicates with:
- Supabase for authentication and data storage
- Backend API for AI processing

## Supabase Integration

### Authentication

The application uses Supabase for authentication. Authentication is handled through the Supabase client:

```typescript
// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Usage in Components

Authentication is used throughout the application, primarily in the `LoginLogoutButton` and `Header` components:

```typescript
// Example usage in components
const supabase = createClient()

// Get session
const { data: { session } } = await supabase.auth.getSession()

// Sign out
await supabase.auth.signOut()
```

## Environment Variables

The following environment variables are required for API integration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Best Practices

1. **Error Handling**
   - Always implement proper error handling for API calls
   - Use try-catch blocks around async operations
   - Display user-friendly error messages

2. **Authentication**
   - Check authentication state before making protected API calls
   - Handle session expiration gracefully
   - Implement proper logout flow

3. **Data Fetching**
   - Use proper loading states during API calls
   - Implement error boundaries where appropriate
   - Cache responses when beneficial

4. **Security**
   - Never expose sensitive credentials in client-side code
   - Use environment variables for configuration
   - Implement proper CORS policies

## Testing

### API Mocks

```typescript
// __mocks__/api.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          title: 'Test Task',
          status: 'completed',
        },
      ])
    );
  }),
];

export const server = setupServer(...handlers);
```

### Testing API Integration

```typescript
// __tests__/api.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useTasks } from '@/hooks/queries/useTask';

describe('API Integration', () => {
  it('fetches tasks successfully', async () => {
    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
  });
}); 