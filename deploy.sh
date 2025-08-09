#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Stop dan remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional, untuk force rebuild)
echo "🗑️ Removing old images..."
docker-compose build --no-cache

# Start new containers
echo "🏃 Starting new containers..."
docker-compose up -d

# Show status
echo "✅ Deployment completed!"
echo "📊 Container status:"
docker-compose ps

echo "📋 Container logs (last 10 lines):"
docker-compose logs --tail=10 frontend