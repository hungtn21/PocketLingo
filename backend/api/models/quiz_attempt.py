from django.db import models
from django.conf import settings

class QuizAttempt(models.Model):
    class Status(models.TextChoices):
        PASSED = 'passed', 'Đạt'
        FAILED = 'failed', 'Trượt'

    id = models.BigAutoField(primary_key=True)
    quiz = models.ForeignKey(
        'Quiz', # Dùng tên model dưới dạng chuỗi
        on_delete=models.CASCADE, 
        related_name='attempts'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='quiz_attempts'
    )
    quiz_answers = models.JSONField()
    status = models.CharField(max_length=6, choices=Status.choices, default=Status.FAILED)
    score = models.DecimalField(max_digits=7, decimal_places=2) 
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    attempt_no = models.IntegerField(default=1)

    def __str__(self):
        return f"Lần làm {self.attempt_no} của {self.user.email} cho {self.quiz.lesson.title}"

    class Meta:
        db_table = 'quiz_attempts'
