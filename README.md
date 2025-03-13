# Digest AI API

This repository contains a Docker Compose setup for the Digest AI API, a FastAPI application that provides browser automation capabilities using Anchor Browser.

## Prerequisites

- Docker and Docker Compose installed on your system
- Anchor Browser API key

## Getting Started

1. Clone this repository:
```bash
git clone <repository-url>
cd digest_ai_dashbord
```

2. Create a `.env` file in the `api` directory with the following variables:
```bash
ANCHOR_API_KEY=your_anchor_browser_api_key
# Add any other required environment variables
```

3. Start the API service using Docker Compose:
```bash
docker-compose up -d
```

4. The API will be available at `http://localhost:8080`

## Project Structure

The project is organized into two main components:

### Backend (API)

```
api/
├── app/                      # Main FastAPI application
│   ├── config/               # Configuration settings
│   ├── migrations/           # Database migrations
│   ├── services/             # Service layer components
│   ├── static/               # Static files
│   ├── utils/                # Utility functions
│   └── main.py               # Main FastAPI application entry point
├── .dockerignore             # Docker ignore file
├── .env                      # Environment variables (create this file)
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker build instructions
└── requirements.txt          # Python dependencies
```

### Frontend

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
├── .env.local                # Local environment variables
├── package.json              # Node.js dependencies
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## API Endpoints

- `GET /` - Health check endpoint
- `POST /api/browse` - Run a browser automation task
- `GET /api/history` - Get run history with pagination
- `GET /api/history/{history_id}` - Get detailed run information
- `DELETE /api/history/{history_id}` - Delete a run history entry

## Environment Variables

The API requires the following environment variables:

- `ANCHOR_API_KEY` - API key for Anchor Browser

## Docker Compose Configuration

The Docker Compose setup includes:

- API service built from the Dockerfile in the api directory
- Volume mounting for code, .env file, and GIF storage
- Network configuration for service communication
- Health check to ensure the API is running properly

## Stopping the Service

```bash
docker-compose down
```

## Monitoring Logs

```bash
docker-compose logs -f api
```