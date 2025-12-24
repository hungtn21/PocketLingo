#!/bin/bash

echo "🚀 Starting deployment on $(hostname)..."

# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Build and start
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Wait for backend to be ready
echo "⏳ Waiting for backend to be healthy..."
sleep 10

# Run migrations (chạy trên cả 2 nhưng chỉ 1 lần thực thi)
echo "🗄️ Running migrations..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

echo "✅ Deployment completed on $(hostname)!"
echo "🌐 Access your site at:"
echo "   http://$(curl -s ifconfig.me)"
echo "   http://pocketlingo.online"