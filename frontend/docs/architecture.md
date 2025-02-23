# Architecture

This document outlines the architectural patterns and decisions used in the frontend application.

## Overview

The frontend is built using Next.js with App Router, following a modular architecture that emphasizes:
- Component-based development
- Type safety with TypeScript
- Server-side rendering (SSR)
- Supabase integration
- Middleware for authentication

## Directory Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes (grouped)
│   ├── history/           # History feature routes
│   ├── profile/           # User profile routes
│   ├── task/              # Task management routes
│   ├── error/             # Error handling
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── history/          # History feature components
│   ├── agent-ui/         # Agent interaction components
│   ├── Header.tsx        # Main header component
│   ├── LoginLogoutButton.tsx # Authentication component
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── TemplateSection.tsx # Task template section
│   └── RootLayoutClient.tsx # Root layout wrapper
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── auth-actions.ts  # Authentication actions
│   └── utils.ts         # General utilities
├── utils/               # Utility functions
│   └── supabase/       # Supabase client and middleware
├── public/              # Static assets
└── types/               # TypeScript type definitions
```

## Core Architecture Patterns

### 1. Feature-First Organization

Components and logic are organized by feature:
```typescript
// Feature example: History Management
frontend/
├── app/history/         # Routes
├── components/history/  # Components
└── types/history.ts    # Type definitions
```

### 2. Layer Separation

Clear separation between:
- Presentation (Components)
- Business Logic (Hooks)
- Data Access (Supabase)
- Authentication (Middleware)

### 3. Component Architecture

```typescript
// Component organization
components/
├── ui/                 # Base UI components (shadcn/ui)
├── history/           # History feature components
├── agent-ui/          # Agent interaction components
└── [root]/            # Core application components
```

## Data Flow

### 1. Server-Side Data Flow

```typescript
// Example server component
export default async function Page() {
  const supabase = createServerClient();
  const { data } = await supabase.from('table').select();
  
  return <ClientComponent initialData={data} />;
}
```

### 2. Client-Side Data Flow

```typescript
// Example client component
const ClientComponent = () => {
  const supabase = createClient();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('table').select();
      setData(data);
    };
    fetchData();
  }, []);
};
```

## Authentication Architecture

### 1. Middleware Protection

```typescript
// middleware.ts
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

### 2. Authentication Components

```typescript
// components/LoginLogoutButton.tsx
const LoginButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
};
```

## State Management

### 1. Server State
- Supabase for data persistence
- Server components for initial data loading
- Middleware for session management

### 2. Client State
- React hooks for local state
- URL state for routing
- Supabase realtime subscriptions when needed

## Performance Optimization

### 1. Component Optimization
- Proper dependency arrays in useEffect
- Memoization when needed
- Clean up of subscriptions and event listeners

### 2. Asset Optimization
- Static file serving from public directory
- Image optimization with Next.js Image component
- CSS optimization with Tailwind

## Error Handling

### 1. App Error Handling

```typescript
// app/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### 2. Component Error Handling

```typescript
try {
  // Operation that might fail
  await supabase.from('table').select();
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error appropriately
}
```

## Development Guidelines

1. **Component Development**
   - Use TypeScript for type safety
   - Follow component organization pattern
   - Implement proper error handling
   - Include loading states

2. **State Management**
   - Use hooks effectively
   - Handle side effects properly
   - Clean up subscriptions
   - Manage loading states

3. **Styling**
   - Use Tailwind CSS classes
   - Follow responsive design principles
   - Maintain accessibility standards
   - Use shadcn/ui components

4. **Performance**
   - Optimize component renders
   - Handle data loading efficiently
   - Implement proper caching
   - Monitor bundle size 