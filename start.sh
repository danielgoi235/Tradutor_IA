#!/bin/bash
set -e

echo "🚀 Installing dependencies..."
npm ci --omit=dev

echo "🔨 Building TypeScript..."
npm run build

echo "🎯 Starting server..."
node dist/server.js
