#!/bin/bash

echo "🚀 Bắt đầu deploy tại $(hostname)..."

# Dừng các container đang chạy
docker-compose -f docker-compose.prod.yml down

# Build và khởi động
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Chờ backend sẵn sàng
echo "⏳ Đang chờ backend sẵn sàng..."
sleep 10

# Chạy migrations (chạy trên cả 2 nhưng chỉ 1 lần thực thi)
echo "🗄️ Đang chạy migrations..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate --noinput

# Lấy static files
echo "📁 Đang lấy static files..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

echo "✅ Deployment completed on $(hostname)!"
echo "🌐 Access your site at:"
echo "   http://$(curl -s ifconfig.me)"
echo "   http://pocketlingo.online"