from django.db import models
from django.conf import settings

class Notification(models.Model):
    class Status(models.TextChoices):
        READ = 'read', 'Đã đọc'
        UNREAD = 'unread', 'Chưa đọc'

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    description = models.TextField()
    status = models.CharField(max_length=6, choices=Status.choices, default=Status.UNREAD)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Thông báo cho {self.user.email}: {self.description[:30]}..."

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
