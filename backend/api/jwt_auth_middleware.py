import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from api.models import User

class JwtAuthMiddleware:
    """ASGI middleware that reads a 'jwt' cookie and sets scope['user'].

    Use by wrapping the websocket application in `JwtAuthMiddleware(...)`.
    """
    def __init__(self, app):
        self.app = app

    def __call__(self, scope):
        # Only handle websocket connections
        if scope.get('type') != 'websocket':
            return self.app(scope)

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
                    user = User.objects.filter(id=user_id).first() or AnonymousUser()
            except Exception:
                user = AnonymousUser()

        scope['user'] = user
        return self.app(scope)
