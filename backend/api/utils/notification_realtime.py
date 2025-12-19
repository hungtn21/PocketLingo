from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_admin_notification(notification):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "admin_notifications",
        {
            "type": "send_notification",
            "notification": notification,
        }
    )

def send_user_notification(user_id, notification):
    """Send a realtime notification to a specific user group.

    Group name: user_{user_id}_notifications
    """
    channel_layer = get_channel_layer()
    group_name = f"user_{user_id}_notifications"
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_notification",
            "notification": notification,
        }
    )
