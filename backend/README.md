# Backend - Lecture Notes Analyzer

Node.js + Express + MongoDB backend with JWT authentication.

## Structure

```
src/
├── controllers/
│   ├── authController.js
│   └── noteController.js
├── middleware/
│   ├── auth.js
│   └── upload.js
├── models/
│   ├── User.js
│   └── Note.js
├── routes/
│   ├── auth.js
│   └── notes.js
├── services/
│   └── nlpService.js
└── server.js
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/notes/upload | Upload note file |
| GET | /api/notes | Get user's notes |
| GET | /api/notes/:id | Get note by ID |
| POST | /api/notes/:id/analyze | Trigger NLP analysis |
| DELETE | /api/notes/:id | Delete note |

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lecture_notes
NLP_SERVICE_URL=http://localhost:8000
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
```