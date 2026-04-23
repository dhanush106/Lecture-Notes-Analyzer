"""
main.py
--------
FastAPI entry point with:
- Startup model pre-warming
- Improved /health endpoint (returns device info)
- Structured logging
"""
import os
import time
import logging
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.analyze import router as analyze_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Lecture Notes NLP Service",
    description="GPU-accelerated NLP microservice for summarization, keyword extraction, and quiz generation",
    version="2.0.0",
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
    from services.nlp_orchestrator import nlp_orchestrator
    from utils.device import device_manager

    logger.info("=" * 60)
    logger.info("NLP Service starting up...")
    logger.info(f"Device: {device_manager.device_str.upper()}")
    logger.info(f"FP16 enabled: {device_manager.use_fp16}")
    logger.info("=" * 60)

    # Load all models in a thread so the event loop doesn't block
    await asyncio.to_thread(nlp_orchestrator.initialize_models)
    logger.info("NLP Service is fully ready ✅")


@app.get("/")
async def root():
    from utils.device import device_manager
    return {
        "status": "ok",
        "service": "nlp-service",
        "version": "2.0.0",
        "device": device_manager.device_str,
        "fp16": device_manager.use_fp16,
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)