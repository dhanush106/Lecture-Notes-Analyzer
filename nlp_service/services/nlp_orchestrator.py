"""
services/nlp_orchestrator.py
-----------------------------
Global singleton orchestrator that initializes all NLP services once at startup.
All services share the same device via device_manager.
"""
import time
import logging
import nltk
from typing import Dict, List, Any
from services.summarizer import SummarizationService
from services.keyword_extractor import KeywordService
from services.question_generator import QuestionService
from utils.device import device_manager

# Download all required NLTK data once
for res in ['punkt', 'punkt_tab', 'stopwords', 'wordnet', 'averaged_perceptron_tagger']:
    try:
        nltk.download(res, quiet=True)
    except Exception:
        pass

logger = logging.getLogger(__name__)


class NLPOrchestrator:
    def __init__(self):
        self._summarizer: SummarizationService = None
        self._keyword_service: KeywordService = None
        self._question_service: QuestionService = None
        self.is_loaded: bool = False

    def initialize_models(self) -> None:
        """Load all models once. Safe to call multiple times (idempotent)."""
        if self.is_loaded:
            return

        logger.info("=" * 60)
        logger.info(f"Initializing NLP models on: {device_manager.device_str.upper()}")
        logger.info(f"Device info: {device_manager.info()}")
        logger.info("=" * 60)

        t0 = time.time()
        self._summarizer      = SummarizationService()
        self._keyword_service = KeywordService()
        self._question_service = QuestionService()

        # Eagerly trigger lazy-loading so first request isn't slow
        logger.info("Pre-warming models (eager load)...")
        _ = self._summarizer.summarizer
        _ = self._keyword_service.model
        _ = self._question_service.model

        self.is_loaded = True
        logger.info(f"All models loaded and ready in {time.time() - t0:.1f}s")
        logger.info("=" * 60)

    # ------------------------------------------------------------------ #
    # Properties — lazy init if called before initialize_models()         #
    # ------------------------------------------------------------------ #
    @property
    def summarizer(self) -> SummarizationService:
        if not self.is_loaded:
            self.initialize_models()
        return self._summarizer

    @property
    def keyword_service(self) -> KeywordService:
        if not self.is_loaded:
            self.initialize_models()
        return self._keyword_service

    @property
    def question_service(self) -> QuestionService:
        if not self.is_loaded:
            self.initialize_models()
        return self._question_service

    # ------------------------------------------------------------------ #
    # Main entry point                                                     #
    # ------------------------------------------------------------------ #
    def analyze(
        self,
        text: str,
        max_keywords: int = 10,
        max_questions: int = 5,
    ) -> Dict[str, Any]:
        t0 = time.time()
        logger.info(f"Starting NLP analysis — input: {len(text)} chars, device: {device_manager.device_str}")

        summary   = self.summarizer.summarize(text)
        keywords  = self.keyword_service.extract_keywords(text, max_keywords)
        questions = self.question_service.generate_questions(text, max_questions)
        word_count = len(text.split())

        elapsed = time.time() - t0
        logger.info(f"NLP analysis complete in {elapsed:.2f}s")

        return {
            "summary":    summary,
            "keywords":   keywords,
            "questions":  questions,
            "word_count": word_count,
        }


# Module-level singleton
nlp_orchestrator = NLPOrchestrator()