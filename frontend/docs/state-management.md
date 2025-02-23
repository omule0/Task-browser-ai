# State Management

This document outlines the state management patterns and practices used in the frontend application.

## Overview

The application uses a combination of:
- Local component state with React hooks
- Supabase for authentication state
- URL state for routing and navigation

## Authentication State

Authentication state is managed through Supabase:

```typescript
// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Usage in components
const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
```

## Local State Management

### Component State

```typescript
// Example from Header.tsx
const [isScrolled, setIsScrolled] = useState(false);
const [userEmail, setUserEmail] = useState<string | null>(null);

// Effect for scroll handling
useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 10);
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### Form State

```typescript
// Example form state management
const [formData, setFormData] = useState({
  title: '',
  description: '',
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};
```

## URL State Management

### Route Parameters

```typescript
// Example route parameter usage in Next.js
const Page = ({ params }: { params: { id: string } }) => {
  // Access route parameters
  const { id } = params;
};
```

### Search Parameters

```typescript
// Example search parameter usage
import { useSearchParams } from 'next/navigation'

const Page = () => {
  const searchParams = useSearchParams()
  const query = searchParams.get('query')
};
```

## Best Practices

1. **State Location**
   - Keep state as close as possible to where it's used
   - Lift state up only when necessary
   - Use URL for shareable state

2. **State Updates**
   - Use functional updates for state that depends on previous value
   - Batch related state updates
   - Handle side effects in useEffect

3. **Performance**
   - Memoize callbacks with useCallback when passing to children
   - Memoize expensive computations with useMemo
   - Split large components to minimize re-renders

4. **Error Handling**
   - Implement proper error boundaries
   - Handle loading and error states
   - Provide fallback UI 