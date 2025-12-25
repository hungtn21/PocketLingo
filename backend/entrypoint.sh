#!/bin/bash
set -e

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start server
echo "Starting server..."
if [ "$1" = "daphne" ]; then
    exec daphne -b 0.0.0.0 -p 8000 backend.asgi:application  # ĐỔI pocketlingo.asgi -> backend.asgi
elif [ "$1" = "gunicorn" ]; then
    exec gunicorn --bind 0.0.0.0:8000 --workers 3 backend.wsgi:application  # ĐỔI pocketlingo.wsgi -> backend.wsgi
else
    # Default: chạy daphne nếu có channels, hoặc gunicorn
    if [ -f "backend/asgi.py" ]; then  # ĐỔI pocketlingo/asgi.py -> backend/asgi.py
        echo "Starting Daphne (ASGI)..."
        exec daphne -b 0.0.0.0 -p 8000 backend.asgi:application  # ĐỔI
    else
        echo "Starting Gunicorn (WSGI)..."
        exec gunicorn --bind 0.0.0.0:8000 --workers 3 backend.wsgi:application  # ĐỔI
    fi
fi