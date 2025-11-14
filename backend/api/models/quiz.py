from django.db import models

class Quiz(models.Model):
    id = models.BigAutoField(primary_key=True)
    lesson = models.ForeignKey(
        'Lesson', # Dùng tên model dưới dạng chuỗi
        on_delete=models.CASCADE, 
        related_name='quizzes'
    )
    time_limit = models.IntegerField(null=True, blank=True, help_text="tính bằng giây")
    passed_score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quiz cho bài học: {self.lesson.title}"

    class Meta:
        db_table = 'quizzes'
        verbose_name_plural = 'Quizzes'
        indexes = [
            models.Index(fields=['lesson']), 
        ]
