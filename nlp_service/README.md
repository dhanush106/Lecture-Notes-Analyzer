# NLP Service - Lecture Notes Analyzer

Python FastAPI microservice for NLP tasks.

## Features

- Text summarization using BART
- Keyword extraction using KeyBERT
- Question generation with MCQ format

## API Endpoint

### POST /analyze

```json
{
  "text": "Lecture content to analyze",
  "max_keywords": 10,
  "max_questions": 5
}
```

**Response:**

```json
{
  "summary": "Summarized text...",
  "keywords": ["keyword1", "keyword2"],
  "questions": [
    {
      "type": "mcq",
      "question": "What is X?",
      "options": ["A. Answer", "B. Other", "C. Different", "D. None"],
      "answer": "A",
      "difficulty": "medium"
    }
  ],
  "word_count": 500,
  "processed_at": "2026-04-23T10:00:00",
  "model_info": {
    "summarizer": "facebook/bart-large-cnn",
    "keywords": "KeyBERT",
    "questions": "t5-small"
  }
}
```

## Setup

```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

## Environment Variables

```env
API_HOST=0.0.0.0
API_PORT=8000
SUMMARIZER_MODEL=facebook/bart-large-cnn
KEYWORD_MODEL=paraphrase-MiniLM-L6-v2
QUESTION_MODEL=google/t5-small
```

## Structure

```
nlp_service/
├── config/
│   └── settings.py
├── models/
│   └── schemas.py
├── routes/
│   └── analyze.py
├── services/
│   ├── summarizer.py
│   ├── keyword_extractor.py
│   ├── question_generator.py
│   └── nlp_orchestrator.py
└── main.py
```