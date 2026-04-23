# Lecture Notes Analyzer - Complete Setup Guide

## Prerequisites

Before starting, install these on your system:

### Windows
1. **Node.js v18+**: https://nodejs.org/ (LTS version)
2. **Python 3.9+**: https://www.python.org/
3. **MongoDB**: https://www.mongodb.com/try (or use MongoDB Atlas cloud)
4. **Git**: https://git-scm.com/

### Verify installations
```bash
node --version
npm --version
python --version
mongod --version
```

---

## Project Structure

```
lecture-notes-analyzer/
├── frontend/          # React + Vite + Tailwind
├── backend/          # Node.js + Express + MongoDB
└── nlp_service/      # Python + FastAPI
```

Create the main folder:
```bash
cd ~
mkdir lecture-notes-analyzer
cd lecture-notes-analyzer
```

---

## STEP 1: Backend Setup

### 1.1 Create backend structure
```bash
mkdir -p backend/src/{controllers,middleware,models,routes,services}
mkdir -p backend/uploads
```

### 1.2 Create backend/package.json
```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0",
    "multer": "^1.4.5-lts.1",
    "pdf-parse": "^1.1.1",
    "xss-clean": "^0.1.4"
  }
}
```

### 1.3 Create backend/.env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lecture_notes
NLP_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=30d
```

### 1.4 Install backend dependencies
```bash
cd backend
npm install
```

---

## STEP 2: Frontend Setup

### 2.1 Create frontend structure
```bash
mkdir -p frontend/src/{store/slices,services,components,pages,hooks,utils}
```

### 2.2 Create frontend/package.json
```json
{
  "name": "frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "lucide-react": "^0.294.0",
    "framer-motion": "^10.16.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^5.0.0"
  }
}
```

### 2.3 Create frontend/vite.config.js
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

### 2.4 Create frontend/tailwind.config.js
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        }
      }
    }
  },
  plugins: []
};
```

### 2.5 Create frontend/postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

### 2.6 Create frontend/src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg font-medium 
           hover:bg-primary-700 transition-colors;
  }
  .btn-secondary {
    @apply bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium 
           hover:bg-gray-200 transition-colors;
  }
  .card {
    @apply bg-white rounded-xl shadow-sm border p-6;
  }
  .input-field {
    @apply w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500;
  }
}

.highlight {
  @apply bg-yellow-200 rounded px-1;
}
```

### 2.7 Install frontend dependencies
```bash
cd frontend
npm install
```

---

## STEP 3: NLP Service Setup

### 3.1 Create nlp_service structure
```bash
mkdir -p nlp_service/{config,models,routes,services}
```

### 3.2 Create nlp_service/requirements.txt
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
torch>=2.0.0
transformers==4.35.2
sentence-transformers==2.2.2
keybert==0.7.0
nltk==3.8.1
```

### 3.3 Create nlp_service/.env
```
API_HOST=0.0.0.0
API_PORT=8000
SUMMARIZER_MODEL=facebook/bart-large-cnn
KEYWORD_MODEL=paraphrase-MiniLM-L6-v2
```

### 3.4 Install NLP dependencies (create virtual environment)
```bash
cd nlp_service
python -m venv venv

# Activate virtual environment:
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

---

## STEP 4: MongoDB Setup

### 4.1 Start MongoDB locally (if not using Atlas)

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or if installed manually:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "C:\data\db"
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 4.2 Or Use MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Update MONGODB_URI in backend/.env:
```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/lecture_notes
```

---

## STEP 5: Running the Services

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Terminal 3: NLP Service
```bash
cd nlp_service
# Activate venv first if not using global Python
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

python -m uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

---

## STEP 6: Verify Installation

### Test Backend
```bash
curl http://localhost:5000/api/health
# Response: {"status": "ok", "service": "backend"}
```

### Test NLP Service
```bash
curl http://localhost:8000/health
# Response: {"status": "healthy"}
```

### Test Frontend
Open: http://localhost:5173

---

## API Endpoints

### Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |

### Notes Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/notes/upload | Upload PDF/TXT |
| GET | /api/notes | Get all notes |
| GET | /api/notes/:id | Get note |
| GET | /api/notes/:id/search | Search in note |
| POST | /api/notes/:id/analyze | NLP analysis |
| DELETE | /api/notes/:id | Delete note |

### NLP Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /analyze | Analyze text |

---

## Common Issues & Solutions

### 1. "Cannot connect to MongoDB"
```bash
# Check MongoDB is running
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux
```

### 2. "Module not found" errors
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
cd nlp_service && pip install -r requirements.txt
```

### 3. "Port already in use"
```bash
# Find and kill the process using the port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Linux:
lsof -i :5000
kill -9 <pid>
```

### 4. NLP model download issues
```bash
# Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

### 5. Vite proxy not working
Make sure `vite.config.js` has:
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

---

## Quick Start Commands Summary

```bash
# 1. Start MongoDB
net start MongoDB  # Windows

# 2. Backend (Terminal 1)
cd backend && npm run dev

# 3. Frontend (Terminal 2)
cd frontend && npm run dev

# 4. NLP Service (Terminal 3)
cd nlp_service
source venv/bin/activate  # or venv\Scripts\activate
python -m uvicorn main:app --reload --port 8000
```

---

## Environment Variables Summary

### backend/.env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lecture_notes
NLP_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
```

### nlp_service/.env
```
API_HOST=0.0.0.0
API_PORT=8000
SUMMARIZER_MODEL=facebook/bart-large-cnn
KEYWORD_MODEL=paraphrase-MiniLM-L6-v2
```

---

## Postman Testing

Import this collection to test:

```json
{
  "info": {
    "name": "Lecture Notes Analyzer",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"password123\"}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@test.com\",\"password\":\"password123\"}"
        }
      }
    }
  ]
}
```

---

## File Locations

| File | Location |
|------|----------|
| Backend Server | `backend/src/server.js` |
| Backend Routes | `backend/src/routes/` |
| Backend Models | `backend/src/models/` |
| Frontend App | `frontend/src/App.jsx` |
| Frontend Pages | `frontend/src/pages/` |
| Frontend Components | `frontend/src/components/` |
| Redux Store | `frontend/src/store/` |
| NLP Main | `nlp_service/main.py` |
| NLP Routes | `nlp_service/routes/` |
| NLP Services | `nlp_service/services/` |

---

## Need Help?

1. Backend API docs: http://localhost:5000/api/health
2. NLP docs: http://localhost:8000/docs
3. Frontend: http://localhost:5173