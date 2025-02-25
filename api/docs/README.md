# Digest AI Dashboard API Documentation

## Overview
The Digest AI Dashboard API is a FastAPI-based service that provides browser automation and AI-powered task execution capabilities. This API serves as the backend for the Digest AI Dashboard, handling browser interactions, task management, and historical data storage.

## Project Structure
```
api/
├── app/
│   ├── services/          # Core services (history, email)
│   ├── utils/            # Utility functions and helpers
│   ├── config/           # Configuration files
│   ├── migrations/       # Database migrations
│   └── main.py          # Main application entry point
├── docs/                # API documentation
└── requirements.txt     # Python dependencies
```

## Core Components

### Main Application (main.py)
- FastAPI application setup and configuration
- CORS middleware configuration
- Browser session management
- Task execution endpoints
- History management endpoints

### Services
1. History Service
   - Manages task execution history
   - Stores and retrieves run details
   - Handles progress tracking

2. Email Service
   - Handles task completion notifications
   - Email template management
   - Notification delivery

## Key Features
- Browser automation with AI assistance
- Task history tracking and management
- Real-time progress streaming
- Email notifications
- Authentication and authorization
- Static file serving

## Documentation Structure
- [Authentication](authentication.md) - Authentication mechanisms and security
- [Endpoints](endpoints.md) - API endpoint documentation
- [Database Schema](database-schema.md) - Data structure and relationships
- [Error Handling](error-handling.md) - Error codes and handling
- [Examples](examples.md) - Usage examples and code snippets

## Dependencies
- FastAPI - Web framework
- LangChain - AI/LLM integration
- Browser-Use - Browser automation
- SQLAlchemy - Database ORM
- Pydantic - Data validation
- Python-dotenv - Environment management

## Environment Setup
The API requires several environment variables to be set in the `.env` file:
- Database configuration
- API keys and secrets
- Email service configuration
- CORS settings

For detailed setup instructions and environment variable requirements, refer to the individual documentation sections. 


docker compose up --build

docker compose down

docker compose up

docker push devdigest/api:api 

docker build -t devdigest/api:api .

docker login -u devdigest