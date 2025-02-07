from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from research_assistant import ResearchAssistant
from essay_writer import EssayWriter

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    topic: str
    additional_context: Optional[str] = None


class EssayRequest(BaseModel):
    topic: str
    outline: Optional[str] = None
    style: Optional[str] = None


@app.post("/api/research")
async def research_topic(request: ResearchRequest):
    try:
        assistant = ResearchAssistant()
        result = assistant.research(request.topic, request.additional_context)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/write-essay")
async def write_essay(request: EssayRequest):
    try:
        writer = EssayWriter()
        essay = writer.write(request.topic, request.outline, request.style)
        return {"essay": essay}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
