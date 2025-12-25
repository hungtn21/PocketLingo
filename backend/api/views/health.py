from django.urls import path
from django.http import JsonResponse
from django.db import connections
from django.conf import settings
from django.utils import timezone
import redis
import logging

logger = logging.getLogger(__name__)

def health_check(request):
    """Health check endpoint for load balancer"""
    checks = {}
    
    # Check database
    try:
        connections['default'].cursor()
        checks['database'] = 'healthy'
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        checks['database'] = 'unhealthy'
    
    # Check Redis if enabled
    if getattr(settings, 'USE_REDIS', False):
        try:
            # Prefer REDIS_URL if available (handles TLS and auth), otherwise build client
            if getattr(settings, 'REDIS_URL', ''):
                redis_client = redis.from_url(settings.REDIS_URL, socket_connect_timeout=2)
            else:
                conn_kwargs = {
                    'host': settings.REDIS_HOST,
                    'port': settings.REDIS_PORT,
                    'password': getattr(settings, 'REDIS_PASSWORD', None),
                    'socket_connect_timeout': 2,
                }
                if getattr(settings, 'REDIS_USE_TLS', False):
                    conn_kwargs['ssl'] = True
                redis_client = redis.Redis(**conn_kwargs)
            redis_client.ping()
            checks['redis'] = 'healthy'
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            checks['redis'] = 'unhealthy'
    
    # Check overall status
    all_healthy = all(status == 'healthy' for status in checks.values())
    
    try:
        timestamp = timezone.now().isoformat()
    except Exception:
        import datetime
        timestamp = datetime.datetime.utcnow().isoformat()

    response_data = {
        'status': 'healthy' if all_healthy else 'unhealthy',
        'checks': checks,
        'instance': getattr(settings, 'INSTANCE_ID', 'unknown'),
        'timestamp': timestamp
    }
    
    status_code = 200 if all_healthy else 503
    return JsonResponse(response_data, status=status_code)
