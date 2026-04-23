import torch
import logging
import os
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ModelConfig:
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    
    SUMMARIZER_MODEL = os.getenv("SUMMARIZER_MODEL", "facebook/bart-large-cnn")
    KEYWORD_MODEL = os.getenv("KEYWORD_MODEL", "paraphrase-MiniLM-L6-v2")
    QUESTION_MODEL = os.getenv("QUESTION_MODEL", "google/flan-t5-base")
    
    MAX_INPUT_LENGTH = 1024
    MAX_SUMMARY_LENGTH = 150
    MIN_SUMMARY_LENGTH = 50
    
    MAX_KEYWORDS = 10
    MAX_QUESTIONS = 5
    
    BATCH_SIZE = 1
    NUM_BEAM = 4
    TEMPERATURE = 0.7

    @classmethod
    def get_device_info(cls) -> dict:
        return {
            "device": cls.DEVICE,
            "cuda_available": torch.cuda.is_available(),
            "cuda_device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0
        }