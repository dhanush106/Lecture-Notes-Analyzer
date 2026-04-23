import logging
import nltk
from typing import Dict
from services.summarizer import SummarizationService
from services.keyword_extractor import KeywordService
from services.question_generator import QuestionService

for res in ['punkt', 'punkt_tab', 'stopwords', 'wordnet', 'averaged_perceptron_tagger']:
    try:
        nltk.download(res, quiet=True)
    except Exception:
        pass

logger = logging.getLogger(__name__)


class NLPOrchestrator:
    def __init__(self):
        self._summarizer = None
        self._keyword_service = None
        self._question_service = None
        self.is_loaded = False
        
    def initialize_models(self):
        if not self.is_loaded:
            logger.info("Pre-loading NLP models globally...")
            self._summarizer = SummarizationService()
            self._keyword_service = KeywordService()
            self._question_service = QuestionService()
            self.is_loaded = True
            logger.info("All NLP models pre-loaded successfully.")
    
    @property
    def summarizer(self):
        if not self.is_loaded:
            self.initialize_models()
        return self._summarizer
    
    @property
    def keyword_service(self):
        if not self.is_loaded:
            self.initialize_models()
        return self._keyword_service
    
    @property
    def question_service(self):
        if not self.is_loaded:
            self.initialize_models()
        return self._question_service
    
    def analyze(self, text: str, max_keywords: int = 10, max_questions: int = 5) -> Dict:
        logger.info("Starting NLP analysis")
        
        summary = self.summarizer.summarize(text)
        keywords = self.keyword_service.extract_keywords(text, max_keywords)
        questions = self.question_service.generate_questions(text, max_questions)
        
        word_count = len(text.split())
        
        logger.info("NLP analysis completed")
        
        return {
            "summary": summary,
            "keywords": keywords,
            "questions": questions,
            "word_count": word_count
        }


nlp_orchestrator = NLPOrchestrator()