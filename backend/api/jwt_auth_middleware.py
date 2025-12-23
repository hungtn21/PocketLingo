import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from api.models import User
from channels.db import database_sync_to_async

class JwtAuthMiddleware:
    """ASGI middleware that reads a 'jwt' cookie and sets scope['user'].

    Use by wrapping the websocket application in `JwtAuthMiddleware(...)`.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Only handle websocket and http connections
        if scope.get('type') not in ('websocket', 'http'):
            return await self.app(scope, receive, send)

        # extract cookies from headers
        headers = dict((k.decode('latin1'), v.decode('latin1')) for k, v in scope.get('headers', []))
        cookies = headers.get('cookie', '')
        jwt_token = None
        if cookies:
            parts = [p.strip() for p in cookies.split(';')]
            for p in parts:
                if p.startswith('jwt='):
                    jwt_token = p[len('jwt='):]
                    break

        user = AnonymousUser()
        if jwt_token:
            try:
                payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = int(payload.get('user_id')) if payload.get('user_id') is not None else None
                if user_id:
                    user = await self.get_user(user_id)
            except Exception:
                user = AnonymousUser()

        scope['user'] = user
        return await self.app(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        """Get user from database asynchronously"""
        return User.objects.filter(id=user_id).first() or AnonymousUser()
