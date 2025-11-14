from django.db import models
from django.conf import settings

class UserLesson(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='user_lessons'
    )
    lesson = models.ForeignKey(
        'Lesson', # Dùng tên model dưới dạng chuỗi
        on_delete=models.CASCADE, 
        related_name='user_lessons'
    )
    bookmark = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'user_lessons'
        indexes = [
            models.Index(fields=['user']), 
        ]
        unique_together = ('user', 'lesson')
