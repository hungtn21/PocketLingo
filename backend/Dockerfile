FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for MySQL and other packages
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --upgrade pip && \
  pip install --no-cache-dir gunicorn daphne

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Copy SSL certificate for MySQL connection
COPY ca.pem /app/ca.pem

# Note: do not run `collectstatic` at image build time for HA setups.
# Collectstatic should run at runtime or push directly to shared storage (GCS/Filestore).

# Healthcheck used by container orchestrators (checks local backend)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://127.0.0.1:8000/health/ || exit 1

# Expose port for the application
EXPOSE 8000

# Add entrypoint to run migrations/collectstatic at container start
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

# Start Daphne server for Django Channels support by default
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]
