# PocketLingo Deployment Guide

## Prerequisites

- Python 3.10+
- Node.js 18+
- Docker (for Redis)
- MySQL database

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
