from rest_framework import serializers
from api.models.notification import Notification

class NotificationSerializer(serializers.ModelSerializer):
    message = serializers.CharField(source='description')
    is_read = serializers.SerializerMethodField()
    link = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'message', 'link', 'is_read', 'created_at']

    def get_is_read(self, obj):
        return obj.status == Notification.Status.READ

    def get_link(self, obj):
        return ''
