import torch
import re
import nltk
import logging
from typing import List
from transformers import pipeline
from config.settings import ModelConfig

logger = logging.getLogger(__name__)

for resource in ['punkt', 'stopwords', 'wordnet']:
    try:
        nltk.data.find(f'tokenizers/{resource}' if resource == 'punkt' else f'corpora/{resource}')
    except LookupError:
        nltk.download(resource, quiet=True)


class SummarizationService:
    def __init__(self):
        self.device = 0 if torch.cuda.is_available() else -1
        self.config = ModelConfig
        self._summarizer = None
    
    @property
    def summarizer(self):
        if self._summarizer is None:
            logger.info(f"Lazy-loading summarization model: {self.config.SUMMARIZER_MODEL}")
            self._summarizer = pipeline(
                "summarization",
                model=self.config.SUMMARIZER_MODEL,
                device=self.device
            )
            logger.info("Summarization model loaded successfully")
        return self._summarizer
    
    def _clean_text(self, text: str) -> str:
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n+', '\n', text)
        text = text.strip()
        return text
    
    def _split_into_chunks(self, text: str, max_tokens: int = 1000) -> List[str]:
        sentences = nltk.sent_tokenize(text)
        chunks, current_chunk, current_length = [], [], 0
        
        for sentence in sentences:
            words = nltk.word_tokenize(sentence)
            sentence_length = len(words)
            
            if sentence_length > max_tokens:
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                    current_chunk, current_length = [], 0
                for i in range(0, sentence_length, max_tokens):
                    chunks.append(' '.join(words[i:i+max_tokens]))
            elif current_length + sentence_length > max_tokens:
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                current_chunk = [sentence]
                current_length = sentence_length
            else:
                current_chunk.append(sentence)
                current_length += sentence_length
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
            
        return chunks
    
    def summarize(self, text: str) -> str:
        cleaned = self._clean_text(text)
        words = cleaned.split()
        
        if len(words) < 50:
            return cleaned
        
        # Adjust max_tokens for the model
        chunks = self._split_into_chunks(cleaned, max_tokens=800)
        
        if len(chunks) == 1:
            try:
                result = self.summarizer(
                    chunks[0],
                    max_length=self.config.MAX_SUMMARY_LENGTH,
                    min_length=self.config.MIN_SUMMARY_LENGTH,
                    do_sample=False,
                    truncation=True
                )
                return result[0]['summary_text']
            except Exception as e:
                logger.error(f"Single chunk summarization failed: {e}")
                return cleaned[:500] + "..."
        
        summaries = []
        for chunk in chunks:
            try:
                # Summary for each chunk
                result = self.summarizer(
                    chunk,
                    max_length=150,
                    min_length=40,
                    do_sample=False,
                    truncation=True
                )
                summaries.append(result[0]['summary_text'])
            except Exception as e:
                logger.warning(f"Chunk summarization failed: {e}")
                continue
        
        if not summaries:
            return cleaned[:500] + "..."
        
        # Merge summaries
        combined = ' '.join(summaries)
        
        # If still too long, summarize the summary
        if len(combined.split()) > 300:
            try:
                final_result = self.summarizer(
                    combined,
                    max_length=self.config.MAX_SUMMARY_LENGTH + 100,
                    min_length=self.config.MIN_SUMMARY_LENGTH + 30,
                    do_sample=False,
                    truncation=True
                )
                return final_result[0]['summary_text']
            except Exception as e:
                logger.error(f"Final summary compression failed: {e}")
                return combined[:1000]
        
        return combined