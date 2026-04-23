"""
services/question_generator.py
--------------------------------
Production-grade question generation with:
- GPU acceleration via device_manager
- FP16 on GPU
- torch.no_grad() inference
- Mixed question types: MCQ, Viva, Short Answer
"""
import re
import time
import random
import torch
import logging
from typing import List, Optional
from transformers import T5Tokenizer, T5ForConditionalGeneration
from config.settings import ModelConfig
from utils.device import device_manager

logger = logging.getLogger(__name__)


class QuestionService:
    def __init__(self):
        self.config = ModelConfig
        self._tokenizer = None
        self._model = None
        logger.info(f"QuestionService init — device: {device_manager.device_str}")

    @property
    def tokenizer(self) -> T5Tokenizer:
        if self._tokenizer is None:
            logger.info(f"Loading T5 tokenizer: {self.config.QUESTION_MODEL}")
            self._tokenizer = T5Tokenizer.from_pretrained(self.config.QUESTION_MODEL)
        return self._tokenizer

    @property
    def model(self) -> T5ForConditionalGeneration:
        if self._model is None:
            logger.info(f"Loading T5 model: {self.config.QUESTION_MODEL} on {device_manager.device_str}")
            t0 = time.time()
            m = T5ForConditionalGeneration.from_pretrained(self.config.QUESTION_MODEL)
            if device_manager.use_fp16:
                m = m.half()  # FP16 for faster GPU inference
            m = m.to(device_manager.torch_device)
            self._model = m
            logger.info(f"T5 model loaded in {time.time() - t0:.1f}s on {device_manager.device_str}")
        return self._model

    # ------------------------------------------------------------------
    # Prompt builders
    # ------------------------------------------------------------------
    def _viva_prompt(self, ctx: str) -> str:
        return f"Generate a deep conceptual viva question based on this context: {ctx}"

    def _short_prompt(self, ctx: str) -> str:
        return f"Generate a short technical question based on this: {ctx}"

    def _mcq_prompt(self, ctx: str) -> str:
        return f"Generate a multiple choice question with 4 options and the correct answer based on: {ctx}"

    # ------------------------------------------------------------------
    # Core generation
    # ------------------------------------------------------------------
    def _generate_single(self, context: str, q_type: str) -> Optional[dict]:
        try:
            if q_type == "mcq":
                prompt = self._mcq_prompt(context)
            elif q_type == "viva":
                prompt = self._viva_prompt(context)
            else:
                prompt = self._short_prompt(context)

            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512,
            ).to(device_manager.torch_device)

            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=128,
                    num_beams=self.config.NUM_BEAM,
                    early_stopping=True,
                )

            generated = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

            if q_type == "mcq":
                return self._build_mcq(generated, context)
            else:
                return {
                    "type": q_type,
                    "question": generated,
                    "answer": f"Refer to: {context[:60]}...",
                    "difficulty": "hard" if q_type == "viva" else "medium",
                }
        except Exception as e:
            logger.warning(f"Question generation failed ({q_type}): {e}")
            return None

    def _build_mcq(self, generated: str, context: str) -> dict:
        q_part = (generated.split("?")[0] + "?") if "?" in generated else generated[:100]
        entities = self._extract_entities(context)
        if not entities:
            entities = ["Concept A", "Concept B", "Concept C", "Correct Answer"]

        correct = entities[0]
        distractors = ["None of the above", "All of the above", "Not applicable"]
        options = [correct] + distractors[:3]
        random.shuffle(options)
        correct_idx = options.index(correct)

        return {
            "type": "mcq",
            "question": q_part,
            "options": [f"{chr(65+i)}. {opt}" for i, opt in enumerate(options)],
            "answer": chr(65 + correct_idx),
            "difficulty": "medium",
        }

    def _extract_entities(self, text: str) -> List[str]:
        try:
            import nltk
            tokens = nltk.word_tokenize(text)
            pos_tags = nltk.pos_tag(tokens)
            return list(dict.fromkeys(
                w for w, p in pos_tags if p in ('NNP', 'NN', 'NNS') and len(w) > 3
            ))[:5]
        except Exception:
            return text.split()[:5]

    def _template_questions(self, text: str, count: int) -> List[dict]:
        entities = self._extract_entities(text) or ["Concept", "Topic"]
        return [
            {
                "type": "short",
                "question": f"Explain the significance of {entities[i % len(entities)]} in this context.",
                "answer": f"Details about {entities[i % len(entities)]} can be found in the lecture notes.",
                "difficulty": "medium",
            }
            for i in range(count)
        ]

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def generate_questions(self, text: str, max_questions: int = 5) -> List[dict]:
        t0 = time.time()
        try:
            sentences = [
                s.strip()
                for s in re.split(r'(?<=[.!?])\s+', text)
                if len(s.split()) > 8
            ]
            if not sentences:
                return self._template_questions(text, max_questions)

            questions = []

            # 50% MCQs
            mcq_count = max(1, max_questions // 2)
            for i in range(min(mcq_count, len(sentences))):
                q = self._generate_single(sentences[i % len(sentences)], "mcq")
                if q:
                    questions.append(q)

            # Viva questions
            viva_count = max(1, (max_questions - len(questions)) // 2)
            for i in range(viva_count):
                idx = (mcq_count + i) % len(sentences)
                q = self._generate_single(sentences[idx], "viva")
                if q:
                    questions.append(q)

            # Fill remaining with short answers
            while len(questions) < max_questions and len(questions) < len(sentences):
                idx = len(questions) % len(sentences)
                q = self._generate_single(sentences[idx], "short")
                if q:
                    questions.append(q)

            # Pad with templates if still short
            if len(questions) < max_questions:
                questions.extend(self._template_questions(text, max_questions - len(questions)))

            logger.info(f"Generated {len(questions)} questions in {time.time() - t0:.2f}s")
            return questions[:max_questions]

        except Exception as e:
            logger.error(f"Question generation pipeline failed: {e}")
            return self._template_questions(text, max_questions)