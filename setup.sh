#!/bin/bash
# Lecture Notes Analyzer - Setup Script for Unix/Mac

echo "========================================"
echo "Lecture Notes Analyzer - Setup"
echo "========================================"
echo ""

# Backend Setup
echo "[1/3] Setting up Backend..."
cd backend || exit 1
npm install
cd ..
echo "Backend setup complete!"
echo ""

# Frontend Setup
echo "[2/3] Setting up Frontend..."
cd frontend || exit 1
npm install
cd ..
echo "Frontend setup complete!"
echo ""

# NLP Service Setup
echo "[3/3] Setting up NLP Service..."
cd nlp_service || exit 1
pip install -r requirements.txt
cd ..
echo "NLP Service setup complete!"
echo ""

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To run all services:"
echo "  npm run dev:all"
echo ""
echo "Or run individually:"
echo "  cd backend && npm run dev"
echo "  cd frontend && npm run dev"
echo "  cd nlp_service && python -m uvicorn main:app --reload --port 8000"
echo ""