# Authentication

This document outlines the authentication system used in the frontend application.

## Overview

The application uses Supabase Authentication for user management, providing:
- Email/Password authentication
- Session management
- Protected routes
- Server-side session handling

## Setup

### Supabase Client Configuration

```typescript
// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Environment Variables

Required environment variables for authentication:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Middleware

The application uses Next.js middleware for session management:

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Authentication Components

### Login/Logout Button

The `LoginLogoutButton` component handles authentication state and actions:

```typescript
// components/LoginLogoutButton.tsx
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";
import { User } from '@supabase/supabase-js';

const LoginButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Render login/logout buttons based on auth state
  if (user) {
    return <Button onClick={() => { signout(); setUser(null); }}>Log out</Button>;
  }
  return <Button variant="outline" onClick={() => router.push("/login")}>Login</Button>;
};
```

## Session Management

### Client-Side Session

Session state is managed through Supabase's client SDK:

```typescript
// Example of session management in components
const supabase = createClient();

// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Listen to auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth state change
});
```

### Server-Side Session

Server-side session handling is managed through middleware and server components:

```typescript
// Example of server-side session handling
import { createServerClient } from '@supabase/ssr'

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const { data: { session } } = await supabase.auth.getSession()
```

## Best Practices

1. **Security**
   - Never store sensitive credentials in client-side code
   - Use environment variables for configuration
   - Implement proper session handling
   - Use HTTPS in production

2. **Error Handling**
   - Implement proper error handling for auth operations
   - Display user-friendly error messages
   - Handle session expiration gracefully

3. **User Experience**
   - Show loading states during auth operations
   - Provide clear feedback for auth actions
   - Implement proper redirects after auth events

4. **Session Management**
   - Check auth state before accessing protected resources
   - Handle session refresh properly
   - Clean up auth subscriptions when components unmount

## Testing Authentication

```typescript
// __tests__/auth.test.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';

describe('Authentication', () => {
  it('handles login correctly', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    // Test implementation
  });
});
``` 