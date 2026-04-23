import torch
import nltk
import re
import logging
from typing import TypedDict
from transformers import pipeline, Summarizer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.probability import FreqDist
from collections import Counter

logger = logging.getLogger(__name__)

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet', quiet=True)


class NLPProcessor:
    def __init__(self):
        self.device = 0 if torch.cuda.is_available() else -1
        logger.info(f"Using device: {'cuda' if self.device == 0 else 'cpu'}")
        
        logger.info("Loading summarization model...")
        self.summarizer = pipeline(
            "summarization",
            model="facebook/bart-large-cnn",
            device=self.device
        )
        logger.info("Models loaded successfully")

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s\.\,\!\?\-]', '', text)
        return text.strip()

    def _split_into_chunks(self, text: str, max_tokens: int = 1024) -> list[str]:
        sentences = nltk.sent_tokenize(text)
        chunks = []
        current_chunk = []
        current_length = 0

        for sentence in sentences:
            sentence_length = len(word_tokenize(sentence))
            if current_length + sentence_length > max_tokens:
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

    async def summarize(self, text: str) -> str:
        cleaned_text = self._clean_text(text)
        chunks = self._split_into_chunks(cleaned_text)
        
        if len(chunks) == 1:
            result = self.summarizer(chunks[0], max_length=150, min_length=50, do_sample=False)
            return result[0]['summary_text']
        
        summaries = []
        for chunk in chunks:
            result = self.summarizer(chunk[:1024], max_length=150, min_length=30, do_sample=False)
            summaries.append(result[0]['summary_text'])
        
        combined = ' '.join(summaries)
        if len(word_tokenize(combined)) > 300:
            result = self.summarizer(combined[:1024], max_length=200, min_length=80, do_sample=False)
            return result[0]['summary_text']
        
        return combined

    def extract_keywords(self, text: str, top_n: int = 10) -> list[str]:
        cleaned_text = self._clean_text(text)
        tokens = word_tokenize(cleaned_text.lower())
        
        stop_words = set(stopwords.words('english'))
        keywords = [
            word for word in tokens 
            if word.isalnum() 
            and len(word) > 3 
            and word not in stop_words
        ]
        
        freq_dist = FreqDist(keywords)
        return [word for word, _ in freq_dist.most_common(top_n)]

    def generate_questions(self, text: str, num_questions: int = 5) -> list[str]:
        sentences = nltk.sent_tokenize(text)
        sentences = [s for s in sentences if len(word_tokenize(s)) > 10][:10]
        
        questions = []
        important_keywords = self.extract_keywords(text, top_n=15)
        
        question_templates = [
            ("What is the significance of {keyword} in the context of this lecture?", "what"),
            ("How does {keyword} relate to the main topic?", "how"),
            ("Why is {keyword} important for understanding {keyword2}?", "why"),
            ("Can you explain the concept of {keyword}?", "explain"),
            ("What are the key characteristics of {keyword}?", "what"),
            ("How is {keyword} implemented or applied?", "how"),
            ("What role does {keyword} play in {keyword2}?", "what"),
            ("What challenges are associated with {keyword}?", "what"),
            ("How does {keyword} differ from {keyword2}?", "how"),
            ("What is the relationship between {keyword} and {keyword2}?", "what"),
        ]
        
        for i, template_info in enumerate(question_templates[:num_questions]):
            template, question_type = template_info
            if important_keywords:
                keyword = important_keywords[i % len(important_keywords)]
                keyword2 = important_keywords[(i + 1) % len(important_keywords)] if len(important_keywords) > 1 else keyword
                question = template.format(keyword=keyword, keyword2=keyword2)
                questions.append(question)
        
        if len(questions) < num_questions and sentences:
            for i, sentence in enumerate(sentences[:num_questions - len(questions)]):
                tokens = word_tokenize(sentence)
                if len(tokens) > 10:
                    question = f"Can you summarize the main points about {important_keywords[i % len(important_keywords)]}?"
                    questions.append(question)
        
        return questions[:num_questions]

    async def process(self, text: str) -> dict:
        logger.info("Starting NLP processing...")
        
        summary = await self.summarize(text)
        keywords = self.extract_keywords(text)
        questions = self.generate_questions(text)
        
        logger.info("NLP processing completed")
        
        return {
            "summary": summary,
            "keywords": keywords,
            "questions": questions
        }