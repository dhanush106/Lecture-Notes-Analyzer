import torch
import logging
from typing import List
from keybert import KeyBERT
from config.settings import ModelConfig

logger = logging.getLogger(__name__)


class KeywordService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.config = ModelConfig
        self._model = None
    
    @property
    def model(self):
        if self._model is None:
            logger.info(f"Lazy-loading KeyBERT model: {self.config.KEYWORD_MODEL}")
            self._model = KeyBERT(model=self.config.KEYWORD_MODEL)
            logger.info("KeyBERT model loaded successfully")
        return self._model
    
    def extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        try:
            keywords = self.model.extract_keywords(
                text,
                keyphrase_ngram_range=(1, 2),
                stop_words='english',
                top_n=max_keywords * 2,
                use_mmr=True,
                diversity=0.5
            )
            
            extracted = [
                kw for kw, score in keywords
                if len(kw) > 2 and score > 0.05
            ][:max_keywords]
            
            if len(extracted) < max_keywords // 2:
                keywords = self.model.extract_keywords(
                    text,
                    stop_words='english',
                    top_n=max_keywords
                )
                extracted = [kw for kw, _ in keywords][:max_keywords]
            
            return extracted
            
        except Exception as e:
            logger.warning(f"KeyBERT extraction failed: {e}")
            return self._fallback_extraction(text, max_keywords)
    
    def _fallback_extraction(self, text: str, max_keywords: int) -> List[str]:
        import nltk
        from nltk.corpus import stopwords
        from nltk.tokenize import word_tokenize
        from collections import Counter
        
        tokens = word_tokenize(text.lower())
        stop_words = set(stopwords.words('english'))
        
        keywords = [
            word for word in tokens
            if word.isalnum() and len(word) > 3 and word not in stop_words
        ]
        
        counter = Counter(keywords)
        return [word for word, _ in counter.most_common(max_keywords)]