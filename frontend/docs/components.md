# Components

This document outlines the main components used in the frontend application.

## Component Organization

```
components/
├── ui/                 # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── avatar.tsx
│   ├── popover.tsx
│   ├── drawer.tsx
│   ├── toast.tsx
│   ├── card.tsx
│   └── ... (other UI components)
├── history/           # History-related components
│   ├── history-list.tsx
│   ├── history-detail.tsx
│   ├── task-detail-content.tsx
│   └── task-history-sidebar.tsx
├── agent-ui/          # Agent interaction components
│   ├── agent-steps.tsx
│   ├── markdown-result.tsx
│   ├── suggestions.tsx
│   ├── input-form.tsx
│   ├── task-recording.tsx
│   ├── settings-drawer.tsx
│   └── ... (other agent UI components)
├── Header.tsx         # Main header component
├── LoginLogoutButton.tsx # Authentication button
├── sidebar.tsx        # Navigation sidebar
├── TemplateSection.tsx  # Task template section
└── RootLayoutClient.tsx # Root layout wrapper
```

## Core Components

### Header Component
`Header.tsx` - Main application header

**Features**:
- User profile display with email initials
- Collapsible sidebar toggle
- Authentication status
- Refresh chat functionality
- Responsive design
- Scroll-based styling

**Props**:
```tsx
interface HeaderProps {
  className?: string;
  isCollapsed: boolean;
  onToggle: (value: boolean) => void;
  onReset?: () => void;
}
```

**Usage**:
```tsx
import Header from '@/components/Header';

<Header 
  isCollapsed={sidebarCollapsed}
  onToggle={handleSidebarToggle}
  onReset={handleChatReset}
/>
```

### Sidebar Navigation
`sidebar.tsx` - Main navigation sidebar

**Features**:
- Route navigation
- Collapsible design
- Active route highlighting

**Usage**:
```tsx
import Sidebar from '@/components/sidebar';

<Sidebar />
```

### Template Section
`TemplateSection.tsx` - Task template management

**Features**:
- Template configuration
- Dynamic form handling
- Real-time validation

**Usage**:
```tsx
import { TemplateSection } from '@/components/TemplateSection';

<TemplateSection />
```

### Login/Logout Button
`LoginLogoutButton.tsx` - Authentication control

**Features**:
- Dynamic state handling
- Supabase authentication integration
- Loading states

**Usage**:
```tsx
import LoginLogoutButton from '@/components/LoginLogoutButton';

<LoginLogoutButton />
```

### Root Layout Client
`RootLayoutClient.tsx` - Client-side root layout wrapper

**Features**:
- Global layout management
- Theme provider integration
- Authentication context

**Usage**:
```tsx
import RootLayoutClient from '@/components/RootLayoutClient';

<RootLayoutClient>{children}</RootLayoutClient>
```

## UI Components

### Button
`ui/button.tsx` - Base button component with variants

### Input
`ui/input.tsx` - Form input component

### Avatar
`ui/avatar.tsx` - User avatar component

### Popover
`ui/popover.tsx` - Popup content component

### Drawer
`ui/drawer.tsx` - Sliding panel component

### Toast
`ui/toast.tsx` - Notification component

### Card
`ui/card.tsx` - Container component

[Add other UI components as needed]

## History Components

### History List
`history/history-list.tsx` - Task history display

**Features**:
- Paginated list view
- History item display
- Filtering and sorting
- Navigation to details

### History Detail
`history/history-detail.tsx` - Detailed history view

**Features**:
- Full history item information
- Task details
- Action history
- Status tracking

### Task Detail Content
`history/task-detail-content.tsx` - Task content display

**Features**:
- Task content rendering
- Status information
- Action buttons
- Progress tracking

### Task History Sidebar
`history/task-history-sidebar.tsx` - History navigation

**Features**:
- History item list
- Quick navigation
- Status indicators
- Filtering options

## Agent UI Components

### Agent Steps
`agent-ui/agent-steps.tsx` - Agent interaction steps

**Features**:
- Step progression
- Status indicators
- Action controls
- Progress tracking

### Markdown Result
`agent-ui/markdown-result.tsx` - Formatted output display

**Features**:
- Markdown rendering
- Code highlighting
- Content formatting
- Copy functionality

### Suggestions
`agent-ui/suggestions.tsx` - User suggestions

**Features**:
- Suggestion list
- Quick actions
- Interactive elements
- Dynamic updates

### Input Form
`agent-ui/input-form.tsx` - User input handling

**Features**:
- Text input
- Form validation
- Submit handling
- Error states

### Task Recording
`agent-ui/task-recording.tsx` - Task recording interface

**Features**:
- Recording controls
- Status display
- Time tracking
- Save/cancel actions

### Settings Drawer
`agent-ui/settings-drawer.tsx` - Configuration panel

**Features**:
- Settings controls
- Preferences management
- Configuration options
- Save functionality

## Best Practices

1. **Component Structure**
   - Use TypeScript for type safety
   - Implement proper error handling
   - Include loading states
   - Follow the single responsibility principle

2. **State Management**
   - Use React hooks effectively
   - Implement proper caching strategies
   - Handle side effects appropriately
   - Use proper dependency arrays in useEffect

3. **Styling**
   - Use Tailwind CSS classes
   - Follow responsive design principles
   - Maintain accessibility standards
   - Use shadcn/ui components where applicable

4. **Performance**
   - Implement proper memoization when needed
   - Use lazy loading for larger components
   - Optimize re-renders
   - Monitor bundle size

## Component Development Guidelines

1. **Creating New Components**
   ```tsx
   // ComponentName.tsx
   interface ComponentProps {
     // Props interface
   }

   const ComponentName = ({ ...props }: ComponentProps) => {
     // Component implementation
   };

   export default ComponentName;
   ```

2. **Testing**
   - Write unit tests for components
   - Test component interactions
   - Verify accessibility
   - Test error states

3. **Documentation**
   - Document props and interfaces
   - Include usage examples
   - Document key features
   - Keep documentation up to date

## Common Patterns

1. **Error Handling**
   ```tsx
   const [error, setError] = useState<Error | null>(null);

   if (error) {
     return <ErrorComponent error={error} />;
   }
   ```

2. **Loading States**
   ```tsx
   const [isLoading, setIsLoading] = useState(true);

   if (isLoading) {
     return <LoadingSpinner />;
   }
   ```