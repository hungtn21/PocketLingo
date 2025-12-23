from django.db import models
from django.conf import settings

class UserLesson(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        'User',  # Tham chiếu trực tiếp đến model User tùy chỉnh
        on_delete=models.CASCADE, 
        related_name='user_lessons'
    )
    lesson = models.ForeignKey(
        'Lesson', # Dùng tên model dưới dạng chuỗi
        on_delete=models.CASCADE,
        related_name='user_lessons'
    )
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    flashcard_completed = models.BooleanField(default=False)
    flashcard_completed_at = models.DateTimeField(null=True, blank=True)
    milestone_xp_awarded = models.BooleanField(default=False)

    class Meta:
        db_table = 'user_lessons'
        indexes = [
            models.Index(fields=['user']), 
        ]
        unique_together = ('user', 'lesson')
