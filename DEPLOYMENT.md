# PocketLingo Deployment Guide - Hướng dẫn deploy PocketLingo

# **Hướng Dẫn Triển Khai PocketLingo**

## **📋 Mục Lục**
1. [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
2. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
3. [Thiết Lập Hạ Tầng](#thiết-lập-hạ-tầng)
4. [Cấu Hình Môi Trường](#cấu-hình-môi-trường)
5. [Các Bước Triển Khai](#các-bước-triển-khai)
6. [Cấu Hình SSL/TLS](#cấu-hình-ssltls)
7. [Giám Sát & Bảo Trì](#giám-sát--bảo-trì)

## **🏗️ Tổng Quan Kiến Trúc**

### **Kiến Trúc Cân Bằng Tải High Availability**
```
                    ┌─────────────────────────────────────┐
                    │         Người Dùng Toàn Cầu         │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │      DNS Round-Robin                 │
                    │    pocketlingo.online               │
                    └─────┬──────────────────────┬────────┘
                          │                      │
           ┌──────────────▼──────┐    ┌─────────▼─────────────┐
           │     VM1 - Primary    │    │     VM2 - Secondary   │
           │  IP: 136.112.26.100  │    │  IP: 35.193.44.85     │
           │  us-central1-c       │    │  us-central1-c        │
           └──────────────────────┘    └───────────────────────┘
                    │                              │
           ┌───────▼───────────────────────┐      │
           │  Docker Stack:                │      │
           │  • Nginx (Load Balancer)      │      │
           │  • Django Backend             │◄─────┘
           │  • React Frontend             │
           │  • Redis (External)           │
           │  • MySQL (External - Aiven)   │
           └───────────────────────────────┘
```

### **Thông Số Kỹ Thuật VM**
- **VM1 (Primary):** `instance-20251224-132529`
  - IP Public: `136.112.26.100`
  - IP Private: `10.128.0.2`
  - Zone: `us-central1-c`
  
- **VM2 (Secondary):** `instance-20251224-010`
  - IP Public: `35.193.44.85`
  - IP Private: `10.128.0.3`
  - Zone: `us-central1-c`

### **Port Mapping**
```
VM1 & VM2:
┌─────────────┬─────────────┬─────────────────────────┐
│ Port        │ Service     │ Mô Tả                   │
├─────────────┼─────────────┼─────────────────────────┤
│ 80 (HTTP)   │ Nginx       │ Truy cập web            │
│ 443 (HTTPS) │ Nginx       │ Truy cập web bảo mật    │
│ 8000        │ Django      │ Backend API (internal)  │
│ 6379        │ Redis       │ Cache & WebSocket       │
│ 3306        │ MySQL       │ Database                │
└─────────────┴─────────────┴─────────────────────────┘
```

## **⚙️ Yêu Cầu Hệ Thống**

### **Phần Cứng Tối Thiểu**
```yaml
Mỗi VM:
- CPU: 2 vCPU (e2-micro)
- RAM: 2GB
- Storage: 20GB SSD
- OS: Ubuntu 22.04 LTS / Debian 11

Tổng:
- 2 VMs độc lập
- 1 Database (MySQL 8.0+)
- 1 Redis instance
- Domain: pocketlingo.online
```

### **Phần Mềm Cần Thiết**
```bash
# Trên mỗi VM
Docker 20.10+
Docker Compose 2.0+
Git
Nginx 
Certbot (cho SSL)
```

## **🛠️ Thiết Lập Hạ Tầng**

### **1. Cấu Hình GCP Firewall Rules**
```bash
# Tạo rules qua GCP Console:
# 1. Vào VPC Network → Firewall
# 2. Tạo rule "allow-web":
#    - Targets: Specified target tags
#    - Target tags: web-server
#    - Source IP ranges: 0.0.0.0/0
#    - Protocols: tcp:80,443

# 3. Gán tag cho VMs:
gcloud compute instances add-tags instance-20251224-132529 --tags=web-server
gcloud compute instances add-tags instance-20251224-010 --tags=web-server
```

### **2. Cấu Hình DNS Records**
```
Tại nhà cung cấp domain:
┌──────────┬──────────┬─────────────────┬──────┐
│ Type     │ Name     │ Value           │ TTL  │
├──────────┼──────────┼─────────────────┼──────┤
│ A        │ @        │ 136.112.26.100  │ 300  │
│ A        │ @        │ 35.193.44.85    │ 300  │
│ A        │ www      │ 136.112.26.100  │ 300  │
│ A        │ www      │ 35.193.44.85    │ 300  │
└──────────┴──────────┴─────────────────┴──────┘
```

### **3. Cài Đặt Docker & Dependencies**
```bash
# SSH vào từng VM
ssh kq161204@136.112.26.100  # VM1
ssh kq161204@35.193.44.85     # VM2

# Cài đặt Docker
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker

# Cài đặt Certbot (cho SSL)
sudo apt install -y certbot python3-certbot-nginx
```

## **🔧 Cấu Hình Môi Trường**

### **Tạo File `.env.production`**
```bash
# Tạo file trên cả 2 VM
cd ~/PocketLingo/backend
cp .env.example .env.production
nano .env.production
```
Nội dung tương tự `.env.example`

### **Cấu Hình Nginx**
**File: `nginx/nginx.conf`**
**File: `nginx/conf.d/pocketlingo.conf` (HTTP trước khi có SSL)**

## **🚀 Các Bước Triển Khai**

### **1. Clone Repository**
```bash
# Trên cả 2 VM
cd ~
git clone <repository-url> PocketLingo
cd PocketLingo
```

### **2. Build và Chạy Docker Containers**
**File: `docker-compose.prod.yml`**

### **3. Script Triển Khai Tự Động**
**Chạy File: `deploy.sh`**  
**Cấp quyền và chạy:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### **4. Triển Khai Trên Từng VM**
**Trên VM1 (Primary):**
```bash
# SSH vào VM1
ssh kq161204@136.112.26.100

# Đảm bảo IS_PRIMARY=true trong .env.production
cd ~/PocketLingo/backend
echo "IS_PRIMARY=true" >> .env.production

# Chạy deploy
cd ~/PocketLingo
./deploy.sh
```

**Trên VM2 (Secondary):**
```bash
# SSH vào VM2
ssh kq161204@35.193.44.85

# Đảm bảo IS_PRIMARY=false trong .env.production
cd ~/PocketLingo/backend
echo "IS_PRIMARY=false" >> .env.production

# Chạy deploy
cd ~/PocketLingo
./deploy.sh
```

## **🔐 Cấu Hình SSL/TLS**

### **1. Lấy SSL Certificate**
```bash
# Chỉ chạy trên VM1 (nếu DNS đã propagate)
sudo certbot --nginx \
    -d pocketlingo.online \
    -d www.pocketlingo.online \
    --email kq161204@gmail.com \
    --agree-tos \
    --non-interactive \
    --redirect
```

### **2. Copy Certificate Sang VM2**
```bash
# Từ VM1, copy certificate sang VM2
scp -r /etc/letsencrypt/live/pocketlingo.online kq161204@35.193.44.85:/etc/letsencrypt/live/

# Hoặc chạy certbot riêng trên VM2
ssh kq161204@35.193.44.85
sudo certbot --nginx -d pocketlingo.online --email kq161204@gmail.com --agree-tos --non-interactive
```


## **👀 Giám Sát & Bảo Trì**

### **1. Kiểm Tra Trạng Thái**
```bash
# Kiểm tra containers
docker ps
docker-compose -f docker-compose.prod.yml ps

# Xem logs
docker logs pocketlingo-backend
docker logs pocketlingo-nginx

# Kiểm tra health
curl http://localhost/health/
curl https://pocketlingo.online/health/
```

### **2. Các lệnh để monitoring**
```bash
# Resource usage
docker stats

# Logs real-time
docker-compose -f docker-compose.prod.yml logs -f

# Database connections
docker-compose -f docker-compose.prod.yml exec backend python manage.py check --database default
```

### **3. Khi update application**
```bash
# Pull code mới
git pull origin main

# Rebuild và deploy
./deploy.sh
```

### **Quick Recovery Script**
```bash
# emergency_recovery.sh
#!/bin/bash
echo "🆘 Emergency Recovery Mode"
docker-compose -f docker-compose.prod.yml down
docker system prune -af
docker volume prune -f
git pull origin main
./deploy.sh
echo "✅ Recovery complete"
```

---
