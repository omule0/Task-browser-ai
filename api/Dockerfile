# Use the official Python base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /code

# Install system dependencies required for browser screenshots and GIF creation
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories with proper permissions
RUN mkdir -p /tmp/digest_ai_gifs && \
    chmod 777 /tmp/digest_ai_gifs

# Copy the requirements file to the working directory
COPY ./requirements.txt /code/requirements.txt

# Install the Python dependencies
RUN pip install --no-cache-dir -r /code/requirements.txt

# Copy the application code to the working directory
COPY ./app /code/app

# Expose the port on which the application will run
EXPOSE 8080

# Run the FastAPI application
CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8080"]