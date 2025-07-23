#!/bin/bash

echo "🚀 Starting deploy process..."

PROJECT_DIR="/home/www/asset-tracker"
cd $PROJECT_DIR

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building project..."
npm run build

echo "🟢 Reloading PM2..."
pm2 startOrReload ecosystem.config.cjs --env production

echo "✅ Deployment finished."
