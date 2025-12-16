import jwt
import datetime
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from ..authentication import JWTCookieAuthentication
from ..models import User
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from ..serializers.user_serializers import UserProfileSerializer
from django.db import transaction

TOKEN_EXPIRY_HOURS = 1
JWT_TOKEN_EXPIRY_DAYS = 7

class RegisterUserView(APIView):
    def post(self, request):
        email = request.data.get('email')
        name = request.data.get('name')

        if not email or not name:
            return Response({'error': 'Vui lòng cung cấp đầy đủ thông tin.'}, status=400)
        try:
            email = email.strip().lower()
            validate_email(email)
        except DjangoValidationError:
            return Response({'error': 'Địa chỉ email không hợp lệ.'}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email đã được sử dụng.'}, status=400)

        payload = {
            'email': email.strip(),
            'name': name.strip(),
            'purpose': 'email_verify',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRY_HOURS) 
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        verify_link = f"{settings.FRONTEND_URL}/set-password?token={token}"
        html_message = render_to_string('verify_email.html', {'name': name, 'verify_link': verify_link})

        send_mail(
            subject='Xác minh email của bạn',
            message=f'Vui lòng nhấp vào liên kết sau để xác minh email của bạn: {verify_link}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
            html_message=html_message
        )

        return Response({'message': 'Vui lòng kiểm tra email để nhận link xác minh.'})

class VerifyEmailView(APIView):
    def get(self, request):
        token = request.GET.get('token')
        try:
            data = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token đã hết hạn.'}, status=400)
        except jwt.InvalidTokenError:
            return Response({'error': 'Token không hợp lệ.'}, status=400)
        if data.get('purpose') != 'email_verify':
            return Response({'error': 'Mục đích token không hợp lệ.'}, status=400)
        return Response({"email": data["email"], "name": data["name"]})

class SetPasswordView(APIView):
    def post(self, request):
        token = request.data.get('token')
        password = request.data.get('password')

        if not token or not password:
            return Response({'error': 'Token và mật khẩu là bắt buộc.'}, status=400)
        try:
            validate_password(password)
        except DjangoValidationError as e:
            return Response({'error': 'Mật khẩu phải gồm ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.', 'details': e.messages}, status=400)
        try:
            data = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token đã hết hạn.'}, status=400)
        except jwt.InvalidTokenError:
            return Response({'error': 'Token không hợp lệ.'}, status=400)
        if data.get('purpose') != 'email_verify':
            return Response({'error': 'Mục đích token không hợp lệ.'}, status=400)

        email = data['email']
        name = data['name']

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email đã được sử dụng.'}, status=400)

        user = User.objects.create(
            email=email.strip(),
            name=name.strip(),
            password_hash=make_password(password),
            role=User.Role.LEARNER,
            status=User.Status.ACTIVE
        )

        return Response({'message': 'Tài khoản đã được tạo thành công.', 'user_id': str(user.id)}, status=201)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Email không tồn tại.'}, status=400)
        
        if user.status != User.Status.ACTIVE:
            return Response({'error': 'Tài khoản không hoạt động.'}, status=400)
        if not check_password(password, user.password_hash):
            return Response({'error': 'Mật khẩu không đúng.'}, status=400)

        payload = {
            'user_id': str(user.id),
            'email': user.email,
            'role': user.role,
            'name': user.name,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=JWT_TOKEN_EXPIRY_DAYS)
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        response = Response({'role': user.role})
        response.set_cookie(
            key='jwt',
            value=token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=7*24*60*60
        )
        return response

class LogoutView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # Disable authentication for logout
    
    def post(self, request):
        response = Response({"message": "Đăng xuất thành công."})
        response.delete_cookie('jwt')
        response.delete_cookie('sessionid')  # Also clear Django session
        return response

class MeView(APIView):
    """Return current authenticated user's minimal info."""
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({'user_id': str(user.id), 'email': user.email, 'role': user.role, 'name': user.name})

class ForgotPasswordView(APIView):
    """Gửi email với token để reset mật khẩu."""
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email là bắt buộc.'}, status=400)
        try:
            email = email.strip().lower()
            validate_email(email)
        except DjangoValidationError:
            return Response({'error': 'Địa chỉ email không hợp lệ.'}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Không reveal nếu email có trong DB (security best practice)
            return Response({'message': 'Nếu email tồn tại, link đặt lại sẽ được gửi.'}, status=200)
        
        # Tạo token reset (purpose: password_reset, exp: 1 hour)
        payload = {
            'email': email.strip(),
            'purpose': 'password_reset',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRY_HOURS)
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        # Gửi email
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        html_message = render_to_string(
            'forgot_password.html',
            {'name': user.name, 'verify_link': reset_link}
        )
        
        send_mail(
            subject='Đặt lại mật khẩu PocketLingo',
            message=f'Nhấp vào liên kết để đặt lại mật khẩu: {reset_link}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
            html_message=html_message
        )
        
        return Response({'message': 'Nếu email tồn tại, link đặt lại sẽ được gửi.'}, status=200)

class ResetPasswordView(APIView):
    """Đặt lại mật khẩu cho user hiện có (forgot password flow)."""
    def post(self, request):
        token = request.data.get('token')
        password = request.data.get('password')

        if not token or not password:
            return Response({'error': 'Token và mật khẩu là bắt buộc.'}, status=400)
        try:
            validate_password(password)
        except DjangoValidationError as e:
            return Response({'error': 'Mật khẩu phải gồm ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.', 'details': e.messages}, status=400)
        try:
            data = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token đã hết hạn.'}, status=400)
        except jwt.InvalidTokenError:
            return Response({'error': 'Token không hợp lệ.'}, status=400)
        
        # Only accept password_reset tokens
        if data.get('purpose') != 'password_reset':
            return Response({'error': 'Mục đích token không hợp lệ.'}, status=400)
        
        email = data['email']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Tài khoản không tồn tại.'}, status=400)
        
        if user.status != User.Status.ACTIVE:
            return Response({'error': 'Tài khoản không hoạt động.'}, status=400)
        
        # Update password
        user.password_hash = make_password(password)
        user.save()
        
        return Response({'message': 'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.'}, status=200)

class ChangePasswordView(APIView):
    """Đổi mật khẩu cho user đã đăng nhập."""
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'error': 'Mật khẩu cũ và mới là bắt buộc.'}, status=400)
        try:
            validate_password(new_password)
        except DjangoValidationError as e:
            return Response({'error': 'Mật khẩu phải gồm ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.', 'details': e.messages}, status=400)

        if user.status != User.Status.ACTIVE:
            return Response({'error': 'Tài khoản không hoạt động.'}, status=400)
        if not check_password(old_password, user.password_hash):
            return Response({'error': 'Mật khẩu cũ không đúng.'}, status=400)
        if old_password == new_password:
            return Response({'error': 'Mật khẩu mới phải khác mật khẩu cũ.'}, status=400)

        user.password_hash = make_password(new_password)
        user.save()

        return Response({'message': 'Mật khẩu đã được cập nhật thành công.'}, status=200)
        
class UserProfileView(APIView):
    """Xem và cập nhật thông tin profile của user đã đăng nhập."""
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            # Trả về serializer với context để có thể tính toán lại statistics
            response_serializer = UserProfileSerializer(updated_user)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=400)
    
class RequestEmailChangeView(APIView):
    """Request an email change for the authenticated user."""
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        new_email = request.data.get('new_email')
        if not new_email:
            return Response({'error': 'Email mới là bắt buộc.'}, status=400)
        try:
            validate_email(new_email)
        except DjangoValidationError:
            return Response({'error': 'Email không hợp lệ.'}, status=400)
        if User.objects.filter(email=new_email).exists():
            return Response({'error': 'Email đã được sử dụng.'}, status=400)

        # Tạo token xác minh email mới
        email_change_payload = {
            'user_id': str(user.id),
            'new_email': new_email.strip().lower(),
            'purpose': 'email_change',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRY_HOURS)
        }
        token = jwt.encode(email_change_payload, settings.SECRET_KEY, algorithm='HS256')
        verify_link = f"{settings.FRONTEND_URL}/verify-email-change?token={token}"

        html_message = render_to_string(
            'verify_email_change.html',
            {'name': user.name, 'verify_link': verify_link}
        )

        send_mail(
            subject='Xác nhận thay đổi email',
            message=f'Nhấp vào link để xác nhận email mới: {verify_link}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[new_email],
            fail_silently=False,
            html_message=html_message
        )

        return Response({'message': 'Email xác nhận đã được gửi.'}, status=200)


class VerifyEmailChangeView(APIView):
    def get(self, request):
        token = request.GET.get('token')
        if not token:
            return Response({'error': 'Thiếu token.'}, status=400)
        try:
            data = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token đã hết hạn.'}, status=400)
        except jwt.InvalidTokenError:
            return Response({'error': 'Token không hợp lệ.'}, status=400)

        if data.get('purpose') != 'email_change':
            return Response({'error': 'Token không hợp lệ.'}, status=400)

        user_id = data.get('user_id')
        new_email = data.get('new_email')

        try:
            with transaction.atomic():
                # Khóa dòng user hiện tại để tránh race condition
                user = User.objects.select_for_update().get(id=user_id)

                # Nếu email đã đúng với user này, coi như đã verify
                if user.email == new_email:
                    return Response({'message': 'Email đã được xác minh thành công.'}, status=200)

                # Kiểm tra email có người khác đang dùng không
                if User.objects.filter(email=new_email).exclude(id=user_id).exists():
                    return Response({'error': 'Email đã được sử dụng.'}, status=400)

                # Update email
                user.email = new_email.strip().lower()
                user.save()

        except User.DoesNotExist:
            return Response({'error': 'Người dùng không tồn tại.'}, status=400)

        return Response({'message': 'Email đã được xác minh thành công.'}, status=200)
    