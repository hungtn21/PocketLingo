"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

from django.core.asgi import get_asgi_application

# Initialize Django ASGI application early to ensure the AppRegistry is populated
# before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from api.routing import websocket_urlpatterns
from api.jwt_auth_middleware import JwtAuthMiddleware


application = ProtocolTypeRouter({
	"http": django_asgi_app,
	"websocket": JwtAuthMiddleware(
		AuthMiddlewareStack(
			URLRouter(
				websocket_urlpatterns
			)
		)
	),
})
