"""
config/settings.py
-------------------
Centralized model and service configuration.
"""
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


class ModelConfig:
    # ------- Model names (overridable via .env) -------
    SUMMARIZER_MODEL: str = os.getenv("SUMMARIZER_MODEL", "facebook/bart-large-cnn")
    KEYWORD_MODEL: str    = os.getenv("KEYWORD_MODEL",    "paraphrase-MiniLM-L6-v2")
    QUESTION_MODEL: str   = os.getenv("QUESTION_MODEL",   "google/flan-t5-base")

    # ------- Summarization limits -------
    MAX_INPUT_LENGTH: int = 1024   # Max tokens per chunk fed to BART
    # NOTE: max/min summary lengths are now computed DYNAMICALLY per input
    #       in SummarizationService._compute_lengths().
    #       The constants below are legacy fallbacks only.
    MAX_SUMMARY_LENGTH: int = 150
    MIN_SUMMARY_LENGTH: int  = 30

    # ------- Keyword / Question limits -------
    MAX_KEYWORDS: int  = 10
    MAX_QUESTIONS: int = 5

    # ------- Inference settings -------
    NUM_BEAM: int   = 4
    BATCH_SIZE: int = 1