# PocketLingo Deployment Guide

## Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- MySQL database (external managed or containerized)

## Backend Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cd backend
cp .env.example .env
```

**Important environment variables for production:**

```env
# Set to False in production
DEBUG=False

# Add your production domain
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Enable Redis for WebSocket support
USE_REDIS=true
REDIS_HOST=your-redis-host
REDIS_PORT=6379

# Database credentials
DB_NAME=your_database
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Generate a strong secret key
SECRET_KEY=your-very-long-random-secret-key

# Email configuration
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Cloudinary for media storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Run Migrations

```bash
python manage.py migrate
```

### 4. Setup Redis

**Option A: Using Docker (Recommended for local development)**

```bash
# From project root
docker-compose up -d redis
```

**Option B: Using Cloud Redis (Production)**

Use managed Redis services like:
- AWS ElastiCache
- DigitalOcean Managed Redis
- Railway Redis
- Render Redis
- Upstash Redis

Set the Redis connection in `.env`:
```env
USE_REDIS=true
REDIS_HOST=your-redis-host.cloud.provider.com
REDIS_PORT=6379
```

### 5. Run Backend

**Development:**
```bash
# Without WebSocket (simple)
python manage.py runserver

# With WebSocket support
uvicorn backend.asgi:application --host 0.0.0.0 --port 8000 --reload
```

**Production:**
```bash
# Use gunicorn with uvicorn workers
pip install gunicorn uvicorn[standard]
gunicorn backend.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 6. Run Background Scheduler (if needed)

```bash
python manage.py start_scheduler
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

For production, set to your backend URL:
```env
VITE_API_URL=https://api.yourdomain.com
```

### 3. Build & Run

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
# Serve the dist folder with a web server (nginx, vercel, netlify, etc.)
```

## WebSocket & Redis Configuration

### Development (No Redis)

Set in `.env`:
```env
USE_REDIS=false
```

This uses `InMemoryChannelLayer` - works fine for single-server development.

### Production (With Redis - REQUIRED)

Set in `.env`:
```env
USE_REDIS=true
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

**Why Redis is required in production:**
- Supports multiple worker processes
- Enables horizontal scaling
- Persists WebSocket connections across server restarts

## Deployment Platforms

### Railway

1. Create new project
2. Add Redis service
3. Add MySQL service
4. Deploy backend (auto-detects Django)
5. Set environment variables
6. Deploy frontend separately (Vite static site)

### Render

1. Create PostgreSQL/MySQL database
2. Create Redis instance
3. Create Web Service (backend)
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn backend.asgi:application -k uvicorn.workers.UvicornWorker`
4. Create Static Site (frontend)
   - Build: `npm run build`
   - Publish: `dist`

### AWS / DigitalOcean

1. Setup EC2/Droplet with Ubuntu
2. Install dependencies
3. Setup Nginx as reverse proxy
4. Use systemd to manage services
5. Setup SSL with Let's Encrypt

## Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Configure `ALLOWED_HOSTS` with your domains
- [ ] Use strong `SECRET_KEY`
- [ ] Enable HTTPS/SSL
- [ ] Setup Redis with password protection
- [ ] Use environment variables for all secrets
- [ ] Configure CORS properly
- [ ] Enable Django's security middleware
- [ ] Regular security updates

## Troubleshooting

### WebSocket 404 Errors

- Ensure `USE_REDIS=true` in production
- Check Redis is running and accessible
- Verify `uvicorn` is used (not `runserver`)

### Database Connection Issues

- Verify database credentials
- Check database host/port accessibility
- Ensure database exists and migrations are run

### Static Files Not Loading

- Run `python manage.py collectstatic`
- Configure static file serving (Nginx/WhiteNoise)
- Check CORS settings for API calls

## Monitoring

- Setup logging for Django
- Monitor Redis memory usage
- Track WebSocket connections
- Setup error tracking (Sentry)

---

## Docker Deployment (Recommended)

This project includes complete Docker configuration for easy deployment of the full stack.

### Quick Start with Docker

```bash
# 1. Configure environment
cd backend
cp .env.example .env
# Edit .env with your production credentials

# 2. Build and start all services
docker-compose up --build -d

# 3. Run migrations
docker-compose exec backend python manage.py migrate

# 4. Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser

# 5. Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

Access your app at: `http://localhost`

### Docker Services Architecture

The `docker-compose.yml` includes:

1. **Nginx** (Port 80/443)
   - Reverse proxy for frontend and backend
   - Serves React static files
   - Routes `/api/` to Django backend
   - Routes `/ws/` for WebSocket connections
   - Serves Django static/media files

2. **Backend** (Django + Daphne)
   - Runs on port 8000 (internal)
   - Handles API requests and WebSocket connections
   - Connected to external MySQL database
   - Uses Redis for Django Channels

3. **Frontend** (React/Vite)
   - Built as static files
   - Served by Nginx

4. **Redis**
   - Supports Django Channels for WebSocket
   - Required for production

### Production Environment Variables

Update `backend/.env` with production values:

```env
# Django
DEBUG=False
SECRET_KEY=your-production-secret-key-min-50-chars
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,localhost

# CORS for Docker deployment
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database (external MySQL)
DB_NAME=pocketlingo_prod
DB_HOST=your-mysql-host.com
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

# Redis (Docker service)
USE_REDIS=true
REDIS_HOST=redis
REDIS_PORT=6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

### SSL/HTTPS Configuration

To enable HTTPS with SSL certificates:

1. Create SSL directory:
```bash
mkdir -p nginx/ssl
```

2. Add your SSL certificates:
```bash
# Place your certificates in nginx/ssl/
nginx/ssl/
├── certificate.crt
└── private.key
```

3. Update `nginx/nginx.conf`:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;

    # ... rest of the configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

4. Uncomment SSL volume in `docker-compose.yml`:
```yaml
volumes:
  - ./nginx/ssl:/etc/nginx/ssl:ro
```

### Docker Commands Reference

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
docker-compose logs -f backend  # Only backend logs
docker-compose logs -f nginx    # Only nginx logs

# Rebuild services after code changes
docker-compose up --build -d

# Execute Django commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py collectstatic

# Restart a specific service
docker-compose restart backend
docker-compose restart nginx

# Clean up (removes containers, volumes, and images)
docker-compose down -v
docker system prune -a

# Shell access to backend container
docker-compose exec backend bash
docker-compose exec backend python manage.py shell
```

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Run migrations if needed
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

### Production Deployment on VPS

1. **Initial Setup**
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose

# Clone repository
git clone <your-repo-url>
cd PocketLingo

# Configure environment
cd backend
cp .env.example .env
nano .env  # Edit with production values
```

2. **Deploy**
```bash
# Build and start
docker-compose up --build -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

3. **Configure Domain**
   - Point your domain's A record to your server IP
   - Update `ALLOWED_HOSTS` in `.env`
   - Configure SSL certificates (see above)
   - Update Nginx config for your domain

### Troubleshooting Docker

**Backend won't start:**
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Missing .env file
# - Database connection failed
# - Invalid environment variables
```

**Frontend not accessible:**
```bash
# Check if frontend built successfully
docker-compose logs frontend

# Verify Nginx is running
docker-compose ps nginx
docker-compose logs nginx
```

**Database connection issues:**
```bash
# Test database connection from backend
docker-compose exec backend python manage.py dbshell

# If using external MySQL, ensure:
# - Firewall allows connection
# - Database user has remote access
# - SSL certificate (ca.pem) is valid
```

**WebSocket not working:**
```bash
# Ensure Redis is running
docker-compose ps redis

# Check Redis connection
docker-compose exec redis redis-cli ping

# Verify backend can connect to Redis
docker-compose exec backend python -c "import redis; r=redis.Redis(host='redis'); print(r.ping())"
```

### Performance Optimization

1. **Use multi-stage builds** (already configured in Dockerfiles)
2. **Enable Nginx caching** for static files
3. **Use CDN** for static assets in production
4. **Monitor container resources:**
```bash
docker stats
```

5. **Limit container resources** in `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### Backup and Restore

**Backup volumes:**
```bash
# Backup Redis data
docker-compose exec redis redis-cli BGSAVE

# Backup uploaded media (if not using Cloudinary)
docker cp pocketlingo-backend:/app/media ./backup-media

# Backup database (external MySQL - use mysqldump)
```

**Restore:**
```bash
# Restore media files
docker cp ./backup-media pocketlingo-backend:/app/media
```
