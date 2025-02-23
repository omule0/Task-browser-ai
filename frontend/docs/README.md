# Digest AI Frontend Documentation

Welcome to the frontend documentation for the Digest AI project. This documentation provides a comprehensive guide to the frontend architecture, components, and development practices.

## Table of Contents

- [Project Overview](./overview.md)
- [Getting Started](./getting-started.md)
- [Architecture](./architecture.md)
- [Components](./components.md)
- [State Management](./state-management.md)
- [Styling Guide](./styling.md)
- [Authentication](./authentication.md)
- [API Integration](./api-integration.md)

## Tech Stack

- **Framework**: Next.js 15.1.7
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: 
  - Radix UI
  - Shadcn/ui
  - Custom components
- **State Management**: React Query
- **Authentication**: Supabase Auth
- **API Client**: Supabase Client
- **Code Quality**: ESLint, TypeScript

## Project Structure

```
frontend/
├── app/                  # Next.js app directory
│   ├── (auth)/          # Authentication routes
│   ├── history/         # History page
│   ├── profile/         # User profile
│   ├── task/            # Task management
│   └── error/           # Error handling
├── components/          # React components
│   ├── ui/             # UI components
│   ├── history/        # History components
│   └── agent-ui/       # Agent UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── public/             # Static assets
├── types/              # TypeScript types
└── utils/              # Utility functions
```

## Key Features

1. **Authentication**
   - Supabase-based authentication
   - Protected routes
   - Session management

2. **Task Management**
   - AI task creation
   - Real-time progress tracking
   - Task history

3. **User Interface**
   - Responsive design
   - Dark/light mode
   - Accessible components

4. **State Management**
   - React Query for server state
   - Real-time updates
   - Optimistic updates

## Development Guidelines

1. **Component Structure**
   - Use functional components
   - Implement proper TypeScript types
   - Follow component naming conventions

2. **Styling**
   - Use TailwindCSS classes
   - Follow design system tokens
   - Maintain consistent spacing

3. **State Management**
   - Use React Query for API data
   - Local state with useState/useReducer
   - Context for global state

4. **Code Quality**
   - Follow ESLint rules
   - Write meaningful comments
   - Use TypeScript strictly

## Getting Started

See [Getting Started](./getting-started.md) for detailed setup instructions. 