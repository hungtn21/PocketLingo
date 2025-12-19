import jwt
from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import UserCourse, Course, User
from ..models import Notification
from ..utils.notification_realtime import send_admin_notification
from api.serializers.notification_serializers import NotificationSerializer
import uuid
from django.utils import timezone


def get_user_from_token(request):
    """Helper function to get user from JWT token in cookie"""
    token = request.COOKIES.get('jwt')
    if not token:
        print("No JWT token found in cookies")
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        print(f"JWT Payload: {payload}")
        user_id = payload.get('user_id')
        print(f"User ID from payload: {user_id}, type: {type(user_id)}")
        if not user_id:
            return None
        # Convert to int if it's a string
        if isinstance(user_id, str):
            user_id = int(user_id)
        user = User.objects.get(id=user_id)
        print(f"Found user: {user}, type: {type(user)}")
        return user
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist, ValueError) as e:
        print(f"Error getting user from token: {e}")
        return None


@api_view(['POST'])
def enroll_course(request, course_id):
    """Tạo yêu cầu đăng ký khóa học"""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Chưa đăng nhập.'}, status=401)
    
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Khóa học không tồn tại.'}, status=404)
    
    # Kiểm tra xem user đã đăng ký chưa
    existing_enrollment = UserCourse.objects.filter(user=user, course=course).first()
    if existing_enrollment:
        if existing_enrollment.status == UserCourse.Status.PENDING:
            return Response({'error': 'Bạn đã gửi yêu cầu đăng ký khóa học này.'}, status=400)
        elif existing_enrollment.status == UserCourse.Status.APPROVED:
            return Response({'error': 'Bạn đã được chấp nhận vào khóa học này.'}, status=400)
        elif existing_enrollment.status == UserCourse.Status.REJECTED:
            # Cho phép đăng ký lại nếu bị từ chối
            existing_enrollment.status = UserCourse.Status.PENDING
            existing_enrollment.requested_at = timezone.now()
            existing_enrollment.reason = None  # Xóa lý do từ chối cũ
            existing_enrollment.save()
            # --- Thêm notification cho admin ---
            _add_admin_notification(user, course)
            return Response({
                'message': 'Đã gửi lại yêu cầu đăng ký thành công.',
                'enrollment': {
                    'id': existing_enrollment.id,
                    'status': existing_enrollment.status,
                    'requested_at': existing_enrollment.requested_at
                }
            }, status=200)
    
    # Tạo enrollment mới
    enrollment = UserCourse.objects.create(
        user=user,
        course=course,
        status=UserCourse.Status.PENDING
    )
    # --- Thêm notification cho admin ---
    _add_admin_notification(user, course)
    return Response({
        'message': 'Đăng ký thành công. Vui lòng chờ duyệt.',
        'enrollment': {
            'id': enrollment.id,
            'status': enrollment.status,
            'requested_at': enrollment.requested_at
        }
    }, status=201)

# --- Helper để thêm notification cho admin ---
def _add_admin_notification(user, course):
    # Create a persistent notification for each admin user
    message = f"{user.name} ({user.email}) đã gửi yêu cầu tham gia khóa học '{course.title}'"
    link = f"/admin/enrollments/requests/"
    # Find admin users (staff or superuser)
    from ..models import User as AppUser
    admins = AppUser.objects.filter(role__in=[AppUser.Role.ADMIN, AppUser.Role.SUPERADMIN])
    for admin in admins:
        notif_obj = Notification.objects.create(user=admin, description=message)
        serializer = NotificationSerializer(notif_obj)
        payload = {
            'unread_count': Notification.objects.filter(user=admin, status=Notification.Status.UNREAD).count(),
            'notification': {**serializer.data, 'link': link}
        }
        try:
            send_admin_notification(payload)
        except Exception:
            # Silently ignore realtime send errors
            pass


@api_view(['GET'])
def get_enrollment_status(request, course_id):
    """Lấy trạng thái đăng ký của user cho một khóa học"""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Chưa đăng nhập.'}, status=401)
    
    try:
        enrollment = UserCourse.objects.get(user=user, course_id=course_id)
        return Response({
            'status': enrollment.status,
            'reason': enrollment.reason,
            'requested_at': enrollment.requested_at,
            'approved_at': enrollment.approved_at
        })
    except UserCourse.DoesNotExist:
        return Response({'status': None})


@api_view(['POST'])
def approve_enrollment(request, enrollment_id):
    """Admin chấp nhận yêu cầu đăng ký (for future admin panel)"""
    user = get_user_from_token(request)
    if not user or user.role not in ['admin', 'superadmin']:
        return Response({'error': 'Không có quyền truy cập.'}, status=403)
    
    try:
        enrollment = UserCourse.objects.get(id=enrollment_id)
        enrollment.status = UserCourse.Status.APPROVED
        enrollment.approved_at = timezone.now()
        enrollment.save()
        return Response({'message': 'Đã chấp nhận yêu cầu đăng ký.'})
    except UserCourse.DoesNotExist:
        return Response({'error': 'Yêu cầu đăng ký không tồn tại.'}, status=404)


@api_view(['POST'])
def reject_enrollment(request, enrollment_id):
    """Admin từ chối yêu cầu đăng ký (for future admin panel)"""
    user = get_user_from_token(request)
    if not user or user.role not in ['admin', 'superadmin']:
        return Response({'error': 'Không có quyền truy cập.'}, status=403)
    
    reason = request.data.get('reason', '')
    if not reason:
        return Response({'error': 'Vui lòng cung cấp lý do từ chối.'}, status=400)
    
    try:
        enrollment = UserCourse.objects.get(id=enrollment_id)
        enrollment.status = UserCourse.Status.REJECTED
        enrollment.reason = reason
        enrollment.save()
        return Response({'message': 'Đã từ chối yêu cầu đăng ký.'})
    except UserCourse.DoesNotExist:
        return Response({'error': 'Yêu cầu đăng ký không tồn tại.'}, status=404)
