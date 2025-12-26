#!/bin/bash
set -e

echo "🚀 Bắt đầu deploy HTTPS tại $(hostname)..."

# 1. Dừng services cũ
echo "🛑 Dừng services cũ..."
sudo systemctl stop nginx 2>/dev/null || true
sudo pkill nginx 2>/dev/null || true
sudo fuser -k 80/tcp 2>/dev/null || true
sudo fuser -k 443/tcp 2>/dev/null || true

# 2. Kiểm tra SSL certificates
echo "🔐 Kiểm tra SSL certificates..."
SSL_DIR="nginx/ssl/live/pocketlingo.online"

# Đảm bảo certificates có tên đúng
if [ -f "$SSL_DIR/domain.cert.pem" ]; then
    echo "📁 Tìm thấy domain.cert.pem, đổi tên thành fullchain.pem..."
    mv "$SSL_DIR/domain.cert.pem" "$SSL_DIR/fullchain.pem"
fi

if [ -f "$SSL_DIR/private.key.pem" ]; then
    echo "📁 Tìm thấy private.key.pem, đổi tên thành privkey.pem..."
    mv "$SSL_DIR/private.key.pem" "$SSL_DIR/privkey.pem"
fi

if [ ! -f "$SSL_DIR/fullchain.pem" ] || [ ! -f "$SSL_DIR/privkey.pem" ]; then
    echo "❌ Không tìm thấy SSL certificates!"
    echo "Vui lòng đặt certificates vào: $SSL_DIR/"
    echo "  - fullchain.pem (hoặc domain.cert.pem)"
    echo "  - privkey.pem (hoặc private.key.pem)"
    exit 1
fi

chmod 644 "$SSL_DIR/fullchain.pem"
chmod 600 "$SSL_DIR/privkey.pem"
echo "✅ SSL certificates OK"

# 3. Dừng containers cũ
echo "🐳 Dừng Docker containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# 4. Build và khởi động
echo "🔨 Build và khởi động containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Đợi Redis
echo "⏳ Đợi Redis healthy..."
for i in {1..20}; do
    if docker-compose -f docker-compose.prod.yml ps redis | grep -q "healthy"; then
        echo "✅ Redis is healthy"
        break
    fi
    sleep 2
    if [ $i -eq 20 ]; then
        echo "⚠️  Redis chưa healthy, nhưng tiếp tục..."
    fi
done

# 6. Đợi backend
echo "⏳ Đang chờ backend sẵn sàng..."
for i in {1..30}; do
    echo "🔍 Thử lần $i/30..."
    
    if docker-compose -f docker-compose.prod.yml exec -T backend curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
        echo "✅ Backend healthy sau $((i * 3)) giây"
        
        # Chạy migrations
        echo "🗄️ Đang chạy migrations..."
        docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate --noinput

        # Static files
        echo "📁 Đang lấy static files..."
        docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput --clear
        
        break
    fi
    
    sleep 3
    
    if [ $i -eq 30 ]; then
        echo "❌ Backend không healthy sau 90 giây"
        echo "📋 Backend logs:"
        docker-compose -f docker-compose.prod.yml logs --tail=50 backend
        exit 1
    fi
done

# 7. Đợi nginx
echo "⏳ Đợi nginx stable..."
sleep 15

# 8. Kiểm tra Nginx
echo "🔧 Kiểm tra Nginx..."
if docker exec pocketlingo-nginx nginx -t 2>/dev/null; then
    echo "✅ Nginx config OK"
else
    echo "⚠️  Kiểm tra Nginx config..."
    docker logs pocketlingo-nginx --tail=20
fi

# 9. Hiển thị kết quả
echo ""
echo "=========================================="
echo "✅ HTTPS Deployment completed!"
echo ""
echo "🌐 Truy cập website:"
echo "   https://pocketlingo.online"
echo "   https://www.pocketlingo.online"
echo ""
echo "📊 Trạng thái containers:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🔧 Kiểm tra kết nối:"
echo "1. HTTP -> HTTPS redirect:"
curl -I http://localhost 2>/dev/null | grep -i "301\|Location" || echo "   ❌ Không test được"

echo ""
echo "2. HTTPS health check:"
if curl -k -s https://localhost/health/ 2>/dev/null; then
    echo "   ✅ HTTPS đang hoạt động"
else
    echo "   ⚠️  HTTPS có thể có vấn đề"
fi

echo ""
echo "3. SSL Certificate:"
if curl -k -v https://localhost 2>&1 | grep -q "SSL certificate"; then
    echo "   ✅ SSL Certificate được nhận"
else
    echo "   ⚠️  Kiểm tra SSL certificate"
fi

echo ""
echo "📋 Logs Nginx (20 dòng cuối):"
docker logs pocketlingo-nginx --tail=20 2>/dev/null | tail -20 || echo "Không đọc được logs"

echo ""
echo "💡 Lệnh debug nếu có vấn đề:"
echo "   docker logs pocketlingo-nginx"
echo "   docker logs pocketlingo-backend"
echo "   docker exec pocketlingo-nginx nginx -t"