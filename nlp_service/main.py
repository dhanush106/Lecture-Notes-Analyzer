from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import os

from routes.analyze import router as analyze_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Lecture Notes NLP Service",
    description="NLP microservice for text analysis, summarization, and question generation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)

@app.on_event("startup")
async def startup_event():
    import asyncio
    from services.nlp_orchestrator import nlp_orchestrator
    logger.info("Initializing NLP models on application startup (this may take a moment)...")
    await asyncio.to_thread(nlp_orchestrator.initialize_models)
    logger.info("NLP Service is fully loaded and ready to accept requests.")


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "nlp-service",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True
    )