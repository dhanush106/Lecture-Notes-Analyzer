from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Text content to analyze")
    max_keywords: int = Field(default=10, ge=3, le=20)
    max_questions: int = Field(default=5, ge=1, le=10)


class Question(BaseModel):
    type: str
    question: str
    options: Optional[List[str]] = None
    answer: str
    difficulty: Optional[str] = "medium"


class AnalyzeResponse(BaseModel):
    summary: str
    keywords: List[str]
    questions: List[Question]
    word_count: int
    processed_at: datetime = Field(default_factory=datetime.now)


class OCRRequest(BaseModel):
    image_base64: Optional[str] = None
    mode: str = "auto"


class OCRResponse(BaseModel):
    success: bool
    text: Optional[str] = None
    stats: Optional[dict] = None
    mode_used: Optional[str] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "nlp-service"
    version: str = "2.0.0"
    models_loaded: bool = False
    device: str = "cpu"
    fp16_enabled: bool = False