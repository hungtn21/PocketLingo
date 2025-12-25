#!/bin/bash

echo "🚀 Bắt đầu deploy tại $(hostname)..."

# Dừng nginx host
echo "🛑 Dừng nginx host..."
sudo systemctl stop nginx 2>/dev/null
sudo pkill nginx 2>/dev/null

# Giải phóng ports
echo "🔓 Giải phóng port 80 và 443..."
sudo fuser -k 80/tcp 2>/dev/null
sudo fuser -k 443/tcp 2>/dev/null

# Dừng containers
echo "🐳 Dừng Docker containers..."
docker-compose -f docker-compose.prod.yml down

# Build và khởi động
echo "🔨 Build và khởi động containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Đợi Redis healthy
echo "⏳ Đợi Redis healthy..."
MAX_ATTEMPTS=20
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker-compose -f docker-compose.prod.yml ps redis | grep -q "healthy"; then
        echo "✅ Redis is healthy"
        break
    fi
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

# Đợi backend healthy - curl TRỰC TIẾP vào container
echo "⏳ Đang chờ backend sẵn sàng..."
MAX_ATTEMPTS=30
ATTEMPT=0
WAIT_TIME=3

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    echo "🔍 Thử lần $((ATTEMPT + 1))/$MAX_ATTEMPTS..."
    
    # Curl TRỰC TIẾP vào backend container, không qua nginx
    if docker-compose -f docker-compose.prod.yml exec -T backend curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
        echo "✅ Backend healthy sau $((ATTEMPT * WAIT_TIME)) giây"
        
        # Chạy migrations
        echo "🗄️ Đang chạy migrations..."
        docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate --noinput

        # Static files
        echo "📁 Đang lấy static files..."
        docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput --clear
        
        break
    fi
    
    sleep $WAIT_TIME
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "❌ Backend không healthy sau $((MAX_ATTEMPTS * WAIT_TIME)) giây"
    echo "📋 Backend logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=50 backend
    exit 1
fi

# Đợi nginx stable
echo "⏳ Đợi nginx stable..."
sleep 5

echo ""
echo "✅ Deployment completed on $(hostname)!"
echo "🌐 Access your site at:"
echo "   http://$(curl -s ifconfig.me)"
echo "   http://pocketlingo.online"
echo ""
echo "📊 Trạng thái containers:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🏥 Health check cuối cùng (qua nginx):"
curl -s http://localhost/health/ 2>/dev/null | python3 -m json.tool || echo "⚠️  Nginx chưa route được, nhưng backend đã healthy"