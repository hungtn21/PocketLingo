from django.db import models
from django.conf import settings

class UserFlashcard(models.Model):
    class Status(models.TextChoices):
        REMEMBERED = 'remembered', 'Đã nhớ'
        NOT_REMEMBERED = 'not_remembered', 'Chưa nhớ'

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        'User',  # Tham chiếu trực tiếp đến model User tùy chỉnh 
        on_delete=models.CASCADE, 
        related_name='user_flashcards'
    )
    flashcard = models.ForeignKey(
        'Flashcard', # Dùng tên model dưới dạng chuỗi
        on_delete=models.CASCADE, 
        related_name='user_flashcards'
    )
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.NOT_REMEMBERED)
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    level = models.IntegerField(default=1)
    next_review_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'user_flashcards'
        indexes = [
            models.Index(fields=['user']), 
        ]
        unique_together = ('user', 'flashcard')
