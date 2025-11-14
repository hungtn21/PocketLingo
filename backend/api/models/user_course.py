from django.db import models
from django.conf import settings

class UserCourse(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Chờ duyệt'
        APPROVED = 'approved', 'Đã duyệt'
        REJECTED = 'rejected', 'Bị từ chối'
        COMPLETED = 'completed', 'Hoàn thành'

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='user_courses'
    )
    course = models.ForeignKey(
        'Course', # Dùng tên model dưới dạng chuỗi
        on_delete=models.CASCADE, 
        related_name='user_courses'
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    progress_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rating = models.FloatField(null=True, blank=True) 
    comment = models.TextField(blank=True, null=True)
    reason = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'user_courses'
        indexes = [
            models.Index(fields=['user']), 
        ]
        unique_together = ('user', 'course')
