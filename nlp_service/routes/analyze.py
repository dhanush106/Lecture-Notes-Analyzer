from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from models.schemas import AnalyzeRequest, AnalyzeResponse, HealthResponse, OCRResponse
from services.nlp_orchestrator import nlp_orchestrator
from services.ocr_service import ocr_service
import logging
import os
import shutil
import tempfile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["NLP"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    import asyncio
    try:
        text = request.text.strip()
        if len(text) < 10:
            raise HTTPException(status_code=400, detail="Text too short for analysis")
        
        if len(text) > 100000:
            logger.warning(f"Text length ({len(text)}) exceeds safe limits, truncating to 100000 chars")
            text = text[:100000]
            
        logger.info(f"Received analysis request: {len(text)} characters")
        
        result = await asyncio.to_thread(
            nlp_orchestrator.analyze,
            text,
            request.max_keywords,
            request.max_questions
        )
        
        logger.info("Analysis completed successfully")
        
        return AnalyzeResponse(
            summary=result["summary"],
            keywords=result["keywords"],
            questions=result["questions"],
            word_count=result["word_count"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/ocr", response_model=OCRResponse)
async def run_ocr(file: UploadFile = File(...), mode: str = Form("auto")):
    try:
        # Save uploaded file to temp
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
        
        logger.info(f"Received OCR request for {file.filename} with mode {mode}")
        
        # Process OCR
        import asyncio
        result = await asyncio.to_thread(ocr_service.extract_text, tmp_path, mode)
        
        # Cleanup
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            
        if not result["success"]:
            return OCRResponse(success=False, error=result.get("error", "Unknown OCR error"))
            
        return OCRResponse(
            success=True,
            text=result["text"],
            stats=result["stats"],
            mode_used=result["mode_used"]
        )
    except Exception as e:
        logger.error(f"OCR Endpoint error: {str(e)}")
        return OCRResponse(success=False, error=str(e))


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        service="nlp-service",
        version="1.0.0",
        models_loaded=nlp_orchestrator.is_loaded
    )