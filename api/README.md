# Digest AI API

This is the backend API for the Digest AI Dashboard, built using FastAPI. The API provides browser automation capabilities using Anchor Browser.

## Project Structure

```
api/
├── app/                      # Main FastAPI application
│   ├── config/               # Configuration settings
│   ├── migrations/           # Database migrations
│   │   └── README.md         # Migration documentation
│   ├── services/             # Service layer components
│   ├── static/               # Static files
│   ├── utils/                # Utility functions
│   ├── __init__.py           # Package initialization
│   └── main.py               # Main FastAPI application entry point
├── .dockerignore             # Docker ignore file
├── .env                      # Environment variables (create this file)
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker build instructions
└── requirements.txt          # Python dependencies
```

## Prerequisites

- Python 3.9+
- Docker and Docker Compose (for containerized deployment)
- Anchor Browser API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
ANCHOR_API_KEY=your_anchor_browser_api_key
DATABASE_URL=your_database_connection_string
# Add any other required environment variables
```

## Local Development

### Setting Up a Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Running the API Locally

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

The API will be available at `http://localhost:8080`.

## Docker Deployment

### Building and Running with Docker Compose

```bash
docker-compose up -d
```

### Stopping the Service

```bash
docker-compose down
```

### Monitoring Logs

```bash
docker-compose logs -f api
```

## API Endpoints

- `GET /` - Health check endpoint
- `POST /api/browse` - Run a browser automation task
- `GET /api/history` - Get run history with pagination
- `GET /api/history/{history_id}` - Get detailed run information
- `DELETE /api/history/{history_id}` - Delete a run history entry

## Database Migrations

The database schema is managed through SQL migration files located in `app/migrations/`. See the [migrations README](app/migrations/README.md) for details on how to apply migrations.

## Adding New Features

1. Create service modules in `app/services/` for new functionality
2. Update the API routes in `app/main.py`
3. Add any necessary database migrations in `app/migrations/`
4. Update the documentation as needed

## Testing

Run tests using pytest:

```bash
pytest
``` 