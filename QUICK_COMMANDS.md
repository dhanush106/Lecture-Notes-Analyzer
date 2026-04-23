# Quick Commands Reference

## Start Everything (3 Terminals)

### Terminal 1 - Start MongoDB (if local)
```bash
net start MongoDB
```

### Terminal 2 - Backend
```bash
cd backend
npm install      # Only first time
npm run dev     # Start server on :5000
```

### Terminal 3 - Frontend
```bash
cd frontend
npm install     # Only first time
npm run dev     # Start on :5173
```

### Terminal 4 - NLP Service
```bash
cd nlp_service
python -m venv venv                 # Only first time
venv\Scripts\activate              # Windows
source venv/bin/activate          # Mac/Linux
pip install -r requirements.txt   # Only first time
python -m uvicorn main:app --reload --port 8000
```

---

## Verify Services

```bash
# Backend
curl http://localhost:5000/api/health

# NLP Service
curl http://localhost:8000/health

# MongoDB
mongosh
```

---

## Common Tasks

### Create new page in frontend
```
frontend/src/pages/NewPage.jsx
frontend/src/App.jsx
  - import NewPage from './pages/NewPage'
  - <Route path="/new" element={<NewPage />} />
```

### Add new route in backend
```
backend/src/routes/newRoute.js
backend/src/server.js
  - import newRouteRouter from './routes/newRoute'
  - app.use('/api/new', newRouteRouter)
```

### Check port usage
```bash
netstat -ano | findstr :5000    # Windows
lsof -i :5000                   # Mac/Linux
```

### Kill process
```bash
taskkill /PID 1234 /F          # Windows
kill -9 1234                  # Mac/Linux
```

### Reinstall dependencies
```bash
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
cd nlp_service && pip install -r requirements.txt
```

---

## Ports Reference

| Service | Port |
|---------|------|
| Frontend | 5173 |
| Backend | 5000 |
| NLP | 8000 |
| MongoDB | 27017 |

---

## Environment Files

```
backend/.env
  PORT=5000
  MONGODB_URI=mongodb://localhost:27017/lecture_notes
  NLP_SERVICE_URL=http://localhost:8000
  CORS_ORIGIN=http://localhost:5173
  JWT_SECRET=your-secret-key
  JWT_EXPIRE=30d

nlp_service/.env
  API_HOST=0.0.0.0
  API_PORT=8000
  SUMMARIZER_MODEL=facebook/bart-large-cnn
  KEYWORD_MODEL=paraphrase-MiniLM-L6-v2
```

---

## Quick API Test

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'

# Login (copy token from response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Use token (replace <token>)
curl http://localhost:5000/api/notes \
  -H "Authorization: Bearer <token>"
```