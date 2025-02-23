# Getting Started

This guide will help you set up and run the Digest AI frontend application locally.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digest_ai_dashboard/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the frontend directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Build

Create a production build:
```bash
npm run build
# or
yarn build
```

Start the production server:
```bash
npm run start
# or
yarn start
```

## Project Configuration

### TypeScript

The project uses TypeScript for type safety. Configuration is in `tsconfig.json`:
- Strict mode enabled
- Next.js specific settings
- Path aliases configured

### ESLint

ESLint is configured for code quality. Configuration in `eslint.config.mjs`:
- Next.js recommended rules
- TypeScript support
- Import sorting

### Tailwind CSS

Tailwind CSS is configured in `tailwind.config.ts`:
- Custom theme settings
- Component classes
- Utility classes

## Development Tools

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Browser Extensions
- React Developer Tools
- Redux DevTools (if using Redux)

## Common Tasks

### Creating New Components

1. Create a new file in `components/` directory
2. Use TypeScript for type definitions
3. Follow component naming conventions
4. Include proper documentation

Example:
```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button
      className="px-4 py-2 bg-primary text-white rounded"
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

### Adding New Pages

1. Create a new directory in `app/`
2. Add `page.tsx` for the route
3. Include necessary components
4. Update navigation if needed

### Working with API

1. Use React Query hooks for data fetching
2. Handle loading and error states
3. Implement proper TypeScript types
4. Use environment variables for API URLs

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Clear `.next` directory
   - Delete `node_modules` and reinstall
   - Check TypeScript errors

2. **Environment Variables**
   - Ensure `.env.local` is present
   - Check variable naming
   - Restart development server

3. **Type Errors**
   - Check type definitions
   - Update dependencies
   - Run TypeScript compiler

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs) 