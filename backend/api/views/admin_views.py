from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.paginator import Paginator
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password

from ..authentication import JWTCookieAuthentication
from ..models import User
from ..serializers.user_serializers import AdminListSerializer, LearnerListSerializer, UserProfileSerializer

def _require_superadmin(user):
    return getattr(user, 'role', None) == User.Role.SUPERADMIN

class AdminListView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_superadmin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        search = request.GET.get('search', '').strip()
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))

        qs = User.objects.filter(role=User.Role.ADMIN).order_by('-created_at')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(email__icontains=search))

        paginator = Paginator(qs, page_size)
        page_obj = paginator.get_page(page)

        data = AdminListSerializer(page_obj.object_list, many=True).data
        return Response({
            'results': data,
            'page': page_obj.number,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'total_items': paginator.count,
        })

    def post(self, request):
        # Only superadmin can create admin
        if not _require_superadmin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        name = (request.data.get('name') or '').strip()
        email = (request.data.get('email') or '').strip().lower()

        if not name or not email:
            return Response({'error': 'Tên và email là bắt buộc.'}, status=400)
        try:
            validate_email(email)
        except DjangoValidationError:
            return Response({'error': 'Địa chỉ email không hợp lệ.'}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email đã được sử dụng.'}, status=400)

        # Gửi email xác nhận, tạo token
        import jwt, datetime
        from django.conf import settings
        from django.core.mail import send_mail
        from django.template.loader import render_to_string

        TOKEN_EXPIRY_HOURS = 1
        payload = {
            'email': email,
            'name': name,
            'purpose': 'admin_email_verify',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRY_HOURS)
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        verify_link = f"{settings.FRONTEND_URL}/set-password?token={token}"
        html_message = render_to_string('verify_email.html', {'name': name, 'verify_link': verify_link})

        send_mail(
            subject='Xác minh email Admin PocketLingo',
            message=f'Vui lòng nhấp vào liên kết sau để xác minh email admin: {verify_link}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
            html_message=html_message
        )

        return Response({'message': 'Vui lòng kiểm tra email để nhận link xác minh.'})

@method_decorator(csrf_exempt, name='dispatch')
class AdminStatusView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, admin_id):
        if not _require_superadmin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        action = request.data.get('action')  # 'lock' or 'unlock'
        try:
            user = User.objects.get(id=admin_id, role=User.Role.ADMIN)
        except User.DoesNotExist:
            return Response({'error': 'Admin không tồn tại'}, status=404)

        if action == 'lock':
            user.status = User.Status.INACTIVE
        elif action == 'unlock':
            user.status = User.Status.ACTIVE
        else:
            return Response({'error': 'Hành động không hợp lệ'}, status=400)

        user.save()
        return Response({'message': 'Cập nhật trạng thái thành công', 'status': user.status})

class LearnerListView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if user is admin or superadmin
        if request.user.role not in [User.Role.ADMIN, User.Role.SUPERADMIN]:
             return Response({'error': 'Forbidden'}, status=403)

        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        search = request.GET.get('search', '')

        queryset = User.objects.filter(role=User.Role.LEARNER).order_by('-created_at')
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(email__icontains=search))

        paginator = Paginator(queryset, page_size)
        try:
            users = paginator.page(page)
        except:
            users = []
            
        serializer = LearnerListSerializer(users, many=True)
        return Response({
            'results': serializer.data,
            'page': page,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count
        })


class LearnerDetailView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, learner_id):
        # only admin or superadmin can view learner details
        if request.user.role not in [User.Role.ADMIN, User.Role.SUPERADMIN]:
            return Response({'error': 'Forbidden'}, status=403)

        try:
            user = User.objects.get(id=learner_id, role=User.Role.LEARNER)
        except User.DoesNotExist:
            return Response({'error': 'Learner not found'}, status=404)

        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

class LearnerStatusView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, learner_id):
        if request.user.role not in [User.Role.ADMIN, User.Role.SUPERADMIN]:
             return Response({'error': 'Forbidden'}, status=403)
        
        try:
            user = User.objects.get(id=learner_id, role=User.Role.LEARNER)
        except User.DoesNotExist:
            return Response({'error': 'Learner not found'}, status=404)

        action = request.data.get('action')
        if action == 'lock':
            user.status = User.Status.INACTIVE
        elif action == 'unlock':
            user.status = User.Status.ACTIVE
        else:
            return Response({'error': 'Invalid action'}, status=400)
        
        user.save()
        return Response({'message': 'Success', 'status': user.status})