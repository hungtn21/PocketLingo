# HƯỚNG DẪN TRIỂN KHAI — PocketLingo

Phiên bản: 1.1
Mục tiêu: Triển khai theo kiến trúc đơn giản — VM1 đóng vai trò Load Balancer (LB) + Frontend + Backend + Scheduler (primary); VM2 là backend dự phòng (secondary, không chạy scheduler).

Địa chỉ máy (theo yêu cầu):
- VM1 (LB, public): kq161204@136.112.26.100
- VM2 (backend, secondary): kq161204@35.193.44.85

Tóm tắt kiến trúc (Option: VM1 làm LB)
- VM1: chạy Nginx (làm LB, serve SPA hoặc proxy tới frontend container), chạy `backend` và `scheduler` (primary).
- VM2: chạy `backend` (không chạy `scheduler`). Chỉ cho phép VM1 truy cập tới VM2:8000.
- Redis/DB: dùng dịch vụ quản lý hoặc cài đặt riêng, hạn chế truy cập theo IP.
- Static/Media: phục vụ bởi VM1 (hoặc dùng S3 cho dài hạn).

Trước khi bắt đầu
- Chuẩn bị file `backend/.env.production` trên cả hai VM (không commit secrets). Các biến tối thiểu cần có:
  - `DEBUG=False`, `SECRET_KEY`, `ALLOWED_HOSTS`
  - Database: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - Redis: `USE_REDIS=true`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
  - SMTP: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`
  - `FRONTEND_URL=https://pocketlingo.online`

Các bước triển khai (chi tiết)

1) Build frontend (máy dev hoặc CI)

```bash
cd frontend
npm ci
npm run build
# output: frontend/dist
```

2) Chạy frontend bằng Docker container trên VM1 (theo yêu cầu)

Mô tả: thay vì copy `dist/` vào filesystem của VM1, ta build image frontend và chạy container trên VM1. Nginx trên VM1 sẽ proxy `/` tới container frontend (ví dụ: 127.0.0.1:8080) hoặc bạn có thể cấu hình nginx container để kết nối trực tiếp tới frontend container.

Ví dụ build và chạy (trên VM1 hoặc CI push image rồi pull trên VM1):

```bash
# build trên VM1 (hoặc build ở CI và push image lên registry rồi pull trên VM1)
docker build -f frontend/Dockerfile -t pocketlingo-frontend:prod frontend

# chạy frontend container (serve trên port 80 bên trong container, map ra 8080 trên host)
docker run -d --name pocketlingo-frontend --restart unless-stopped -p 127.0.0.1:8080:80 pocketlingo-frontend:prod
```

Lưu ý cấu hình Nginx (`nginx/conf.d/pocketlingo.conf`): sửa phần `location /` để proxy tới frontend container (127.0.0.1:8080) thay cho `root /usr/share/nginx/html` nếu bạn chọn chạy frontend container. Ví dụ ngắn trong `pocketlingo.conf`:

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

3) Cấu hình Nginx upstream backend

- Mở `nginx/nginx.conf` và đặt `upstream backend_servers` thành:
  - `server 127.0.0.1:8000;`  # backend trên VM1
  - `server 35.193.44.85:8000;` # backend trên VM2

4) TLS (HTTPS) trên VM1

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pocketlingo.online -d www.pocketlingo.online
```

5) Start services trên VM1 (LB + BE + scheduler). Ví dụ dùng Docker Compose (nếu bạn muốn dùng compose để quản lý backend/nginx/scheduler):

```bash
# copy repo và backend/.env.production lên VM1
cd /home/youruser/pocketlingo
docker-compose -f docker-compose.prod.yml build backend nginx
# frontend đã chạy dưới dạng container riêng theo bước 2
docker-compose -f docker-compose.prod.yml up -d backend scheduler nginx
```

Ghi chú:
- `entrypoint.sh` trong image backend sẽ chạy migrations và `collectstatic` khi container khởi động.
- Nếu bạn phục vụ static từ VM1 filesystem (không dùng frontend container), chạy `collectstatic` và copy `staticfiles` vào nơi Nginx đọc được. Tuy nhiên với frontend container, frontend static đã được build và serve bởi container.

6) Start services trên VM2 (secondary — backend only)

Trên VM2 (35.193.44.85) chỉ chạy backend, không chạy scheduler:

```bash
cd /home/youruser/pocketlingo
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml up -d backend
```

Hoặc dùng file override `docker-compose.no-scheduler.yml` để loại bỏ `scheduler` khi khởi.

7) Static / Media (nếu VM1 phục vụ static)

Nếu bạn để backend collectstatic vào volume dùng chung với Nginx (compose), sau khi backend chạy trên VM1 thực hiện:

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
docker cp pocketlingo-backend:/app/staticfiles ./staticfiles
sudo mkdir -p /app/staticfiles
sudo rsync -avz ./staticfiles/ /app/staticfiles/
```

Lời khuyên: Dùng S3/Cloud Storage cho static/media nếu có thể.

8) Firewall / Network

- Mở 80/443 cho VM1 (LB) public.
- Chỉ cho phép VM1 truy cập VM2:8000; chặn truy cập trực tiếp tới VM2 từ Internet.
- Giới hạn truy cập DB/Redis theo IP hoặc dùng dịch vụ quản lý.

9) Scheduler: đảm bảo chỉ có một instance

- Chỉ chạy `scheduler` trên VM1. Đặt `USE_REDIS=true` và cấu hình khóa (lock) để tránh trùng lặp nếu cần.

Sự cố VM1 (Single point of failure) & Đề xuất HA

- Hiện tại kiến trúc VM1 là LB + Frontend + Backend + Scheduler — đây là một điểm đơn (SPOF). Nếu VM1 bị mất (ngắt mạng, tắt máy, lỗi), dịch vụ sẽ bị gián đoạn (frontend và LB không còn phục vụ).
- Một số phương án giảm rủi ro (tăng tính sẵn sàng):
  - Option A (khuyến nghị): Dùng managed load balancer (Cloud LB) hoặc triển khai 2 LB (sử dụng `keepalived`/VRRP) để có IP nổi. Hai LB có thể reverse-proxy tới backend VM1/VM2. Scheduler vẫn chỉ chạy trên một node (khoá Redis).
  - Option B: Đưa frontend lên CDN (ví dụ Cloudflare, S3 + CloudFront) — frontend vẫn truy cập được nếu VM1 tụt, và API có thể chuyển hướng tới backend servers qua LB riêng.
  - Option C (HA bằng 2 LB trên VM1+VM2): Chạy `nginx` (LB) trên cả hai VM và dùng `keepalived` (VRRP) hoặc DNS failover để có IP nổi / chuyển traffic tự động. Đồng thời đảm bảo `static`/`media` nằm trên storage chia sẻ hoặc object storage để cả hai node có thể phục vụ cùng nội dung.

    - Tổng quan các bước:
      1. Cài `nginx` và cấu hình `pocketlingo.conf` + `nginx.conf` giống nhau trên cả VM1 và VM2 (upstream backend có thể trỏ tới backend container local và peer).
      2. Cài `keepalived` trên cả hai VM để thiết lập VRRP và gán một Virtual IP (VIP) nổi — cấu hình giản lược:

```text
# /etc/keepalived/keepalived.conf (ví dụ trên VM1)
vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    authentication {
        auth_type PASS
        auth_pass yourpassword
    }
    virtual_ipaddress {
        203.0.113.10  # VIP public hoặc private tùy thiết kế
    }
}
```

      3. Trên VM2 set `state BACKUP` và priority thấp hơn (ví dụ 90). Khi VM1 chết, VM2 sẽ nhảy lên giữ VIP và tiếp tục serve.
      4. Đảm bảo healthcheck và failover: cấu hình `nginx` health checks hoặc external probe để keepalived/monitorer có thể detect service-down.

    - Storage cho `static`/`media` (thay cho S3):
      - GCP Cloud Storage (gs://): object storage tương đương S3 — tốt, bền, dễ tích hợp.
      - GCP Filestore (NFS): shared filesystem (nếu cần filesystem semantics) — cả 2 VM mount chung.
      - Self-hosted MinIO: S3-compatible object storage chạy trên VM/cluster (chi phí thấp, tự quản).
      - Network File Share: NFS/GlusterFS/CephFS nếu cần POSIX filesystem chia sẻ.
      - Cloud alternatives: AWS S3 + EFS, Azure Blob + Azure Files đều là lựa chọn tương đương.

    - GCP có ổn không? Có — GCP cung cấp:
      - Cloud Storage (object storage, tương đương S3) cho static/media.
      - Filestore (NFS) cho shared filesystem nếu bạn cần mount filesystem trên cả 2 VM.
      - Managed Load Balancer (Cloud Load Balancing) là lựa chọn đơn giản hơn thay vì tự làm `keepalived`.
      - Cloud DNS / health checks / CDN tích hợp (Cloud CDN) cho frontend.

    - Lời khuyên ngắn:
      - Nếu muốn đơn giản và sẵn sàng đầu tư: dùng GCP Cloud Load Balancer + Cloud Storage + Cloud CDN — không phải quản lý VRRP, đảm bảo HA cao.
      - Nếu muốn tự quản trên 2 VM: dùng `keepalived` + `nginx` + shared storage (Filestore/NFS/MinIO).

    - Cẩn trọng:
      - Nếu dùng VRRP với VIP public, đảm bảo mạng/VPC cho phép VIP (cân nhắc provider limits).
      - Đảm bảo `scheduler` chỉ chạy một node (lock via Redis) bất kể LB nào đang giữ VIP.
  - Option D (nếu muốn đơn giản): Chuẩn bị playbook phục hồi nhanh — script để khởi lại container trên VM2, hoặc dùng Docker image từ registry và DNS TTL thấp để chuyển traffic.


- Scheduler: luôn chỉ chạy một instance; bật `USE_REDIS=true` và sử dụng khoá phân tán để tránh chạy trùng công việc trên nhiều node.

GCP: lưu static/media (chi tiết)

- Hai cách phổ biến để lưu static/media khi triển khai HA trên 2 LB:
  1) Object storage (khuyến nghị): **GCP Cloud Storage (GCS)** — tương đương S3. Lưu media và (tuỳ cấu hình) file static build vào bucket `gs://your-bucket`.
  2) Shared filesystem: **GCP Filestore** (NFS) — mount trên cả 2 VM tại `/app/staticfiles` để `nginx` serve trực tiếp.

- Tích hợp GCS với Django (media):
  1. Tạo bucket trên GCP Console: `gs://pocketlingo-static`.
  2. Tạo Service Account với quyền `Storage Object Admin` (hoặc quyền tối thiểu cần thiết) và lưu key JSON (tốt nhất dùng Workload Identity thay vì key file).
  3. Thêm `django-storages` và `google-cloud-storage` vào `requirements.txt`.
  4. Ví dụ cấu hình trong `settings.py`:

```python
INSTALLED_APPS += ['storages']

DEFAULT_FILE_STORAGE = 'storages.backends.gcloud.GoogleCloudStorage'
GS_BUCKET_NAME = 'pocketlingo-static'
# Sử dụng GOOGLE_APPLICATION_CREDENTIALS env var nếu bạn dùng key file
```

  5. Sau cấu hình, `collectstatic` và lưu media sẽ ghi vào GCS.

- Dùng Filestore (NFS) để serve static trực tiếp từ cả 2 VM:
  1. Tạo Filestore instance trong GCP (chọn region/VPC phù hợp).
  2. Mount Filestore lên cả 2 VM (ví dụ mount vào `/app/staticfiles`):

```bash
sudo mkdir -p /app/staticfiles
sudo mount -t nfs -o vers=3 <FILESTORE_IP>:/vol1 /app/staticfiles
# để mount vĩnh viễn, thêm dòng tương ứng vào /etc/fstab
```

  3. Sau khi mount, `nginx` trên cả 2 VM có thể serve nội dung từ `/app/staticfiles` (cấu hình `pocketlingo.conf` đã ưu tiên serve từ đây trước khi fallback tới frontend container).

- Khi nên dùng cái nào:
  - Dùng **GCS + CDN (Cloud CDN)** khi bạn ưu tiên hiệu năng, khả năng mở rộng và ít vận hành.
  - Dùng **Filestore** khi cần filesystem semantics (ví dụ thao tác file trực tiếp, hoặc ứng dụng cần POSIX FS).
  - Dùng **MinIO** nếu muốn tự quản object storage trên hạ tầng của bạn.

- Bảo mật & best practices:
  - Nếu có thể, dùng Workload Identity (GKE/Compute) hoặc metadata-based credentials, tránh lưu Service Account key trên đĩa.
  - Cấp quyền tối thiểu cho service account.
  - Nếu dùng Filestore, bảo đảm network/VPC chỉ cho phép truy cập từ 2 VM.

10) Smoke tests

```bash
curl -I https://pocketlingo.online/api/health/
curl -I https://pocketlingo.online/
# kiểm tra websocket
wscat -c wss://pocketlingo.online/ws/<path>

ssh kq161204@136.112.26.100
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py send_daily_reminders
docker logs -f pocketlingo-scheduler
```

Tóm tắt lệnh nhanh

# Trên VM1 (LB + FE container + BE + scheduler)

```bash
cd /home/youruser/pocketlingo
docker build -f frontend/Dockerfile -t pocketlingo-frontend:prod frontend
docker run -d --name pocketlingo-frontend --restart unless-stopped -p 127.0.0.1:8080:80 pocketlingo-frontend:prod
docker-compose -f docker-compose.prod.yml build backend nginx
docker-compose -f docker-compose.prod.yml up -d backend scheduler nginx
```

# Trên VM2 (secondary BE only)

```bash
cd /home/youruser/pocketlingo
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml up -d backend
```

Gợi ý & best practices
- Dùng S3 cho static/media để tránh đồng bộ thủ công.
- Dùng CI/CD: build frontend image và push lên registry, VM1 chỉ cần pull và run.
- Quản lý secrets bằng secret manager (Vault, Cloud KMS, AWS/GCP secret manager).

File liên quan trong repo:
- [docker-compose.prod.yml](docker-compose.prod.yml)
- [backend/Dockerfile](backend/Dockerfile)
- [backend/entrypoint.sh](backend/entrypoint.sh)
