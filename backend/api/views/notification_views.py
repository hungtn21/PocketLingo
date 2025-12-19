
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from api.models.notification import Notification
from api.serializers.notification_serializers import NotificationSerializer
from django.shortcuts import get_object_or_404


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
def get_admin_notifications_db(request):
    user = getattr(request, 'user', None)
    # require admin role in view (simple check)
    if not user or not getattr(user, 'role', None) in [getattr(user, 'role', None), None] and not user.is_staff:
        # allow only staff/superuser
        if not (user and (user.is_staff or user.is_superuser)):
            return Response({'error': 'Không có quyền truy cập.'}, status=403)
    # For admin notifications, return the most recent notifications (system-wide)
    notifications = Notification.objects.all().order_by('-created_at')[:100]
    unread_count = notifications.filter(status=Notification.Status.UNREAD).count()
    serializer = NotificationSerializer(notifications, many=True)
    return Response({'notifications': serializer.data, 'unread_count': unread_count})


@api_view(['DELETE'])
def delete_admin_notification(request, notif_id):
    user = getattr(request, 'user', None)
    if not user or not (user.is_staff or user.is_superuser):
        return Response({'error': 'Không có quyền truy cập.'}, status=403)
    notif = get_object_or_404(Notification, id=notif_id)
    notif.delete()
    return Response({'success': True})
