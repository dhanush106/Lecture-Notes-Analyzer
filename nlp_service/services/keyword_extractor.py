"""
services/keyword_extractor.py
------------------------------
Production-grade keyword extraction with GPU acceleration.
Uses KeyBERT + SentenceTransformer explicitly on GPU.
"""
import time
import logging
from typing import List
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer
from config.settings import ModelConfig
from utils.device import device_manager

logger = logging.getLogger(__name__)


class KeywordService:
    def __init__(self):
        self.config = ModelConfig
        self._model = None
        logger.info(f"KeywordService init — device: {device_manager.device_str}")

    @property
    def model(self) -> KeyBERT:
        if self._model is None:
            logger.info(f"Loading KeyBERT model: {self.config.KEYWORD_MODEL} on {device_manager.device_str}")
            t0 = time.time()
            # Explicitly pass device to SentenceTransformer so it uses GPU
            sentence_model = SentenceTransformer(
                self.config.KEYWORD_MODEL,
                device=device_manager.device_str,
            )
            self._model = KeyBERT(model=sentence_model)
            logger.info(f"KeyBERT model loaded in {time.time() - t0:.1f}s on {device_manager.device_str}")
        return self._model

    def extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        t0 = time.time()
        try:
            keywords = self.model.extract_keywords(
                text,
                keyphrase_ngram_range=(1, 2),
                stop_words='english',
                top_n=max_keywords * 2,
                use_mmr=True,
                diversity=0.5,
            )

            extracted = [
                kw for kw, score in keywords
                if len(kw) > 2 and score > 0.05
            ][:max_keywords]

            # Fallback: lower threshold if too few keywords
            if len(extracted) < max_keywords // 2:
                keywords = self.model.extract_keywords(
                    text,
                    stop_words='english',
                    top_n=max_keywords,
                )
                extracted = [kw for kw, _ in keywords][:max_keywords]

            logger.info(f"Keywords extracted in {time.time() - t0:.2f}s — {len(extracted)} found")
            return extracted

        except Exception as e:
            logger.warning(f"KeyBERT extraction failed: {e} — using NLTK fallback")
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