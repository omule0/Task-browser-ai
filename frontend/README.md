# Digest AI Dashboard Frontend

This is the frontend application for the Digest AI Dashboard, built using Next.js and React. The application provides a user interface for managing browser automation tasks using Anchor Browser.

## Project Structure

```
frontend/
├── app/                      # Next.js app directory (App Router)
│   ├── (auth)/               # Authentication-related pages
│   ├── api/                  # API route handlers
│   ├── error/                # Error handling components
│   ├── feedback/             # Feedback-related pages
│   ├── history/              # History pages
│   ├── profile/              # User profile pages
│   ├── task/                 # Task management pages
│   ├── task_chat/            # Task chat interface
│   ├── template/             # Template views
│   ├── template-studio/      # Template editing interface
│   ├── globals.css           # Global CSS styles
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Home page component
├── components/               # Reusable React components
│   ├── agent-ui/             # Agent UI components
│   ├── history/              # History-related components
│   ├── ui/                   # UI library components
│   └── ...                   # Various shared components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility libraries
├── public/                   # Static public assets
├── supabase/                 # Supabase configuration
├── utils/                    # Utility functions
└── ...                       # Configuration files
```

## Technologies Used

- **Next.js**: React framework for server-side rendering and client-side navigation
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For styling
- **Supabase**: For authentication and database
- **Shadcn UI**: Component library with Radix UI
- **React Query**: For data fetching and state management

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8080
# Add any other required environment variables
```

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
