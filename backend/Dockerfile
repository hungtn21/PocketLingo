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
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install gunicorn daphne

COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy project files
COPY . .

# Copy SSL certificate for MySQL connection
COPY ca.pem /app/ca.pem

# Collect static files (will run during build)
RUN python manage.py collectstatic --noinput || echo "Collectstatic failed, will retry at runtime"

# Expose port for the application
EXPOSE 8000

# Start Daphne server for Django Channels support
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]
