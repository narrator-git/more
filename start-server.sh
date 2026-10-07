#!/bin/bash

# Quick start script for more AI backend server

echo "🚀 Starting more AI Backend Server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists, if not create a placeholder (no real key is stored in the repo)
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
OPENAI_API_KEY=
PORT=3000
NODE_ENV=development
EOF
    echo "✅ .env file created. Add your OpenAI key to OPENAI_API_KEY before using AI chat."
    echo ""
fi

echo "🌟 Starting server on http://localhost:3000"
echo "📋 Health check: http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
