import jwt
from django.conf import settings
from rest_framework import authentication
from rest_framework import exceptions
from api.models import User


class JWTCookieAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class that reads JWT token from cookies
    """
    def authenticate(self, request):
        token = request.COOKIES.get('jwt')
        
        if not token:
            return None
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token đã hết hạn')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Token không hợp lệ')
        
        try:
            user_id = int(payload['user_id']) if isinstance(payload['user_id'], str) else payload['user_id']
            user = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError):
            raise exceptions.AuthenticationFailed('User không tồn tại')
        
        if user.status != User.Status.ACTIVE:
            raise exceptions.AuthenticationFailed('Tài khoản không hoạt động')
        
        return (user, None)
