import torch
import re
import logging
from typing import List
from transformers import pipeline, T5Tokenizer, T5ForConditionalGeneration
from config.settings import ModelConfig

logger = logging.getLogger(__name__)


class QuestionService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.config = ModelConfig
        
        logger.info(f"Loading T5 model: {self.config.QUESTION_MODEL}")
        model_name = self.config.QUESTION_MODEL
        self.tokenizer = T5Tokenizer.from_pretrained(model_name)
        self.model = T5ForConditionalGeneration.from_pretrained(model_name)
        self.model.to(self.device)
        logger.info("T5 model loaded")
    
    def _prepare_viva_prompt(self, context: str) -> str:
        return f"Generate a deep conceptual viva question based on this context: {context}"

    def _prepare_short_answer_prompt(self, context: str) -> str:
        return f"Generate a short technical question based on this: {context}"

    def _prepare_mcq_prompt(self, context: str) -> str:
        return f"Generate a multiple choice question with 4 options and the correct answer based on: {context}"

    def generate_questions(self, text: str, max_questions: int = 5) -> List[dict]:
        try:
            tokenizer, model = self.tokenizer, self.model
            
            # Divide text into meaningful segments for different types of questions
            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.split()) > 8]
            if not sentences:
                return self._generate_template_questions(text, max_questions)

            questions = []
            
            # Generate MCQs (50% of requests)
            mcq_count = max(1, max_questions // 2)
            for i in range(min(mcq_count, len(sentences))):
                segment = sentences[i % len(sentences)]
                q = self._generate_single_question(segment, "mcq")
                if q: questions.append(q)
            
            # Generate Viva questions
            viva_count = max(1, (max_questions - len(questions)) // 2)
            for i in range(viva_count):
                idx = (mcq_count + i) % len(sentences)
                segment = sentences[idx]
                q = self._generate_single_question(segment, "viva")
                if q: questions.append(q)

            # Fill remaining with short answers
            while len(questions) < max_questions and len(questions) < len(sentences):
                idx = len(questions) % len(sentences)
                segment = sentences[idx]
                q = self._generate_single_question(segment, "short")
                if q: questions.append(q)
            
            if len(questions) < max_questions:
                questions.extend(self._generate_template_questions(text, max_questions - len(questions)))

            return questions[:max_questions]
            
        except Exception as e:
            logger.error(f"Question generation pipeline failed: {e}")
            return self._generate_template_questions(text, max_questions)

    def _generate_single_question(self, context: str, q_type: str) -> dict:
        try:
            if q_type == "mcq":
                prompt = self._prepare_mcq_prompt(context)
            elif q_type == "viva":
                prompt = self._prepare_viva_prompt(context)
            else:
                prompt = self._prepare_short_answer_prompt(context)

            inputs = self.tokenizer(prompt, return_tensors="pt", padding=True, truncation=True, max_length=512).to(self.device)
            outputs = self.model.generate(**inputs, max_length=128, num_beams=4, early_stopping=True)
            generated = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            if q_type == "mcq":
                return self._parse_mcq(generated, context)
            else:
                return {
                    "type": q_type,
                    "question": generated,
                    "answer": "Refer to section: " + context[:50] + "...",
                    "difficulty": "hard" if q_type == "viva" else "medium"
                }
        except Exception as e:
            logger.warning(f"Single question generation failed ({q_type}): {e}")
            return None

    def _parse_mcq(self, generated: str, context: str) -> dict:
        # Simple heuristic to extract question and options if the model generates them in a specific format
        # Or just use the generated text as question and synthesize options
        if "?" in generated:
            q_part = generated.split("?")[0] + "?"
        else:
            q_part = generated[:100]
        
        entities = self._extract_key_entities(context)
        if not entities: entities = ["Answer A", "Answer B", "Answer C", "Answer D"]
        
        correct = entities[0]
        options = [correct]
        distractors = ["None of the above", "All of the above", "Irrelevant concept", "Opposite view"]
        options.extend(distractors[:3])
        
        import random
        random.shuffle(options)
        
        correct_index = options.index(correct)
        
        return {
            "type": "mcq",
            "question": q_part,
            "options": [f"{chr(65+i)}. {opt}" for i, opt in enumerate(options)],
            "answer": chr(65 + correct_index),
            "difficulty": "medium"
        }

    def _extract_key_entities(self, text: str) -> List[str]:
        try:
            import nltk
            tokens = nltk.word_tokenize(text)
            pos_tags = nltk.pos_tag(tokens)
            # Focus on Proper Nouns and Nouns
            keywords = [word for word, pos in pos_tags if pos in ['NNP', 'NN', 'NNS'] and len(word) > 3]
            return list(dict.fromkeys(keywords))[:5]
        except Exception:
            return text.split()[:5]

    def _generate_template_questions(self, text: str, count: int) -> List[dict]:
        entities = self._extract_key_entities(text)
        if not entities: entities = ["Concept", "Topic"]
        
        questions = []
        for i in range(count):
            entity = entities[i % len(entities)]
            questions.append({
                "type": "short",
                "question": f"Explain the significance of {entity} in this context.",
                "answer": f"Details about {entity} can be found in the lecture notes.",
                "difficulty": "medium"
            })
        return questions