"""
services/summarizer.py
----------------------
Production-grade summarization service with:
- GPU acceleration (auto-detected)
- Dynamic max/min length based on tokenizer token count
- FP16 (half precision) on GPU for speed
- Singleton lazy-loading
- torch.no_grad() inference
"""
import re
import time
import torch
import nltk
import logging
from typing import List
from transformers import pipeline, AutoTokenizer
from config.settings import ModelConfig
from utils.device import device_manager

logger = logging.getLogger(__name__)

# Ensure NLTK data is available
for resource in ['punkt', 'punkt_tab', 'stopwords']:
    try:
        nltk.download(resource, quiet=True)
    except Exception:
        pass


class SummarizationService:
    def __init__(self):
        self.config = ModelConfig
        self._summarizer = None
        self._tokenizer = None
        logger.info(f"SummarizationService init — device: {device_manager.device_str}")

    @property
    def tokenizer(self):
        if self._tokenizer is None:
            logger.info(f"Loading tokenizer: {self.config.SUMMARIZER_MODEL}")
            self._tokenizer = AutoTokenizer.from_pretrained(self.config.SUMMARIZER_MODEL)
        return self._tokenizer

    @property
    def summarizer(self):
        if self._summarizer is None:
            logger.info(f"Loading summarization model: {self.config.SUMMARIZER_MODEL} on {device_manager.device_str}")
            t0 = time.time()
            self._summarizer = pipeline(
                "summarization",
                model=self.config.SUMMARIZER_MODEL,
                device=device_manager.pipeline_device,
                torch_dtype=torch.float16 if device_manager.use_fp16 else torch.float32,
            )
            logger.info(f"Summarization model loaded in {time.time() - t0:.1f}s")
        return self._summarizer

    # ------------------------------------------------------------------
    # Dynamic length calculation using real token counts
    # ------------------------------------------------------------------
    def _compute_lengths(self, text: str) -> tuple[int, int]:
        """Returns (max_length, min_length) based on token count of input."""
        token_ids = self.tokenizer.encode(text, truncation=False)
        input_len = len(token_ids)

        if input_len < 50:
            max_len = max(20, int(input_len * 0.80))
            min_len = max(10, int(input_len * 0.40))
        else:
            max_len = max(20, int(input_len * 0.60))
            min_len = max(10, int(input_len * 0.30))

        # Clamp: summary must be shorter than the input
        max_len = min(max_len, input_len - 1, self.config.MAX_INPUT_LENGTH)
        min_len = min(min_len, max_len - 1)

        logger.debug(f"Input tokens: {input_len} → max_len={max_len}, min_len={min_len}")
        return max_len, min_len

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n+', '\n', text)
        return text.strip()

    def _split_into_chunks(self, text: str, max_tokens: int = 900) -> List[str]:
        """Split text into chunks based on token count to avoid model limits."""
        sentences = nltk.sent_tokenize(text)
        chunks, current_chunk, current_length = [], [], 0

        for sentence in sentences:
            token_len = len(self.tokenizer.encode(sentence, truncation=False))
            if token_len > max_tokens:
                # Single oversized sentence — truncate it
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                    current_chunk, current_length = [], 0
                truncated = self.tokenizer.decode(
                    self.tokenizer.encode(sentence, truncation=True, max_length=max_tokens),
                    skip_special_tokens=True
                )
                chunks.append(truncated)
            elif current_length + token_len > max_tokens:
                chunks.append(' '.join(current_chunk))
                current_chunk = [sentence]
                current_length = token_len
            else:
                current_chunk.append(sentence)
                current_length += token_len

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        return chunks

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def summarize(self, text: str) -> str:
        t0 = time.time()
        cleaned = self._clean_text(text)

        # Too short to summarize
        if len(cleaned.split()) < 30:
            logger.info("Text too short — returning as-is")
            return cleaned

        chunks = self._split_into_chunks(cleaned, max_tokens=900)
        logger.info(f"Summarizing {len(chunks)} chunk(s) on {device_manager.device_str}")

        with torch.no_grad():
            if len(chunks) == 1:
                max_len, min_len = self._compute_lengths(chunks[0])
                try:
                    result = self.summarizer(
                        chunks[0],
                        max_length=max_len,
                        min_length=min_len,
                        do_sample=False,
                        truncation=True,
                    )
                    summary = result[0]['summary_text']
                except Exception as e:
                    logger.error(f"Single-chunk summarization failed: {e}")
                    return cleaned[:500] + "..."
            else:
                summaries = []
                for i, chunk in enumerate(chunks):
                    try:
                        max_len, min_len = self._compute_lengths(chunk)
                        result = self.summarizer(
                            chunk,
                            max_length=max_len,
                            min_length=min_len,
                            do_sample=False,
                            truncation=True,
                        )
                        summaries.append(result[0]['summary_text'])
                    except Exception as e:
                        logger.warning(f"Chunk {i+1} summarization failed: {e}")

                if not summaries:
                    return cleaned[:500] + "..."

                combined = ' '.join(summaries)

                # Compress multi-chunk summary if still long
                combined_tokens = len(self.tokenizer.encode(combined, truncation=False))
                if combined_tokens > 300:
                    try:
                        max_len, min_len = self._compute_lengths(combined)
                        result = self.summarizer(
                            combined,
                            max_length=max_len,
                            min_length=min_len,
                            do_sample=False,
                            truncation=True,
                        )
                        summary = result[0]['summary_text']
                    except Exception as e:
                        logger.error(f"Final compression failed: {e}")
                        summary = combined
                else:
                    summary = combined

        elapsed = time.time() - t0
        logger.info(f"Summarization complete in {elapsed:.2f}s on {device_manager.device_str}")
        return summary