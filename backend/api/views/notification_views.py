
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from ..authentication import JWTCookieAuthentication
from rest_framework.response import Response
from rest_framework import status
from api.models.notification import Notification
from api.serializers.notification_serializers import NotificationSerializer
from django.shortcuts import get_object_or_404
from api.models.user import User


@api_view(['POST'])
def mark_notification_read(request):
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return Response({'error': 'Unauthorized'}, status=401)
    notif_id = request.data.get('id')
    if not notif_id:
        return Response({'error': 'Missing id'}, status=400)
    notif = get_object_or_404(Notification, id=notif_id, user=user)
    notif.status = Notification.Status.READ
    notif.save()
    unread_count = Notification.objects.filter(user=user, status=Notification.Status.UNREAD).count()
    return Response({'success': True, 'unread_count': unread_count})

@api_view(['GET'])
def get_user_notifications_db(request):
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return Response({'error': 'Unauthorized'}, status=401)
    notifications = Notification.objects.filter(user=user).order_by('-created_at')
    unread_count = notifications.filter(status=Notification.Status.UNREAD).count()
    serializer = NotificationSerializer(notifications, many=True)
    return Response({'notifications': serializer.data, 'unread_count': unread_count})

@api_view(['DELETE'])
def delete_user_notification(request, notif_id):
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return Response({'error': 'Unauthorized'}, status=401)
    notif = get_object_or_404(Notification, id=notif_id, user=user)
    notif.delete()
    return Response({'success': True})


@api_view(['GET'])
@authentication_classes([JWTCookieAuthentication])
@permission_classes([IsAuthenticated])
def get_admin_notifications_db(request):
    import traceback
    try:
        # Ensure request is authenticated via cookie JWT
        user = getattr(request, 'user', None)
        # Only allow staff/superuser or users with admin roles
        if not (user and (getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False) or getattr(user, 'role', None) in [User.Role.ADMIN, User.Role.SUPERADMIN])):
            return Response({'error': 'Không có quyền truy cập.'}, status=403)

        # For admin notifications, return notifications intended for the current admin user
        notifications = Notification.objects.filter(user=user).order_by('-created_at')[:100]
        # Unread count only for this admin
        unread_count = Notification.objects.filter(user=user, status=Notification.Status.UNREAD).count()
        serializer = NotificationSerializer(notifications, many=True)
        return Response({'notifications': serializer.data, 'unread_count': unread_count})
    except Exception as e:
        print('Error in get_admin_notifications_db:', e)
        traceback.print_exc()
        return Response({'error': 'Lỗi server khi lấy thông báo admin', 'details': str(e)}, status=500)


@api_view(['POST'])
@authentication_classes([JWTCookieAuthentication])
@permission_classes([IsAuthenticated])
def create_admin_notification(request):
    user = getattr(request, 'user', None)
    # require admin role
    if not user or not (user.is_staff or user.is_superuser or getattr(user, 'role', None) in [User.Role.ADMIN, User.Role.SUPERADMIN]):
        return Response({'error': 'Không có quyền truy cập.'}, status=403)

    data = request.data or {}
    message = data.get('message') or data.get('description') or data.get('text') or ''
    if not message:
        return Response({'error': 'Thiếu nội dung thông báo'}, status=400)

    try:
        notif = Notification.objects.create(user=user, description=message)
        serializer = NotificationSerializer(notif)
        unread_count = Notification.objects.filter(user=user, status=Notification.Status.UNREAD).count()
        return Response({'notification': serializer.data, 'unread_count': unread_count})
    except Exception as e:
        return Response({'error': 'Lỗi khi tạo thông báo'}, status=500)


@api_view(['DELETE'])
@authentication_classes([JWTCookieAuthentication])
@permission_classes([IsAuthenticated])
def delete_admin_notification(request, notif_id):
    user = getattr(request, 'user', None)
    if not user or not (user.is_staff or user.is_superuser):
        return Response({'error': 'Không có quyền truy cập.'}, status=403)
    notif = get_object_or_404(Notification, id=notif_id)
    notif.delete()
    return Response({'success': True})


@api_view(['POST'])
@authentication_classes([JWTCookieAuthentication])
@permission_classes([IsAuthenticated])
def mark_all_admin_notifications_read(request):
    user = getattr(request, 'user', None)
    if not user or not (user.is_staff or user.is_superuser):
        return Response({'error': 'Không có quyền truy cập.'}, status=403)
    try:
        # Mark all admin notifications for this admin user as read
        Notification.objects.filter(user=user, status=Notification.Status.UNREAD).update(status=Notification.Status.READ)
        unread_count = Notification.objects.filter(user=user, status=Notification.Status.UNREAD).count()
        return Response({'success': True, 'unread_count': unread_count})
    except Exception as e:
        return Response({'error': 'Lỗi server khi đánh dấu tất cả là đã đọc', 'details': str(e)}, status=500)
