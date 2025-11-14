from django.db import models

class Question(models.Model):
    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'multiple_choice', 'Trắc nghiệm'
        DRAG_DROP = 'drag_drop', 'Kéo thả'
        FILL_IN = 'fill_in', 'Điền vào chỗ trống'

    id = models.BigAutoField(primary_key=True)
    quiz = models.ForeignKey(
        'Quiz', # Dùng tên model dưới dạng chuỗi
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QuestionType.choices)
    order_index = models.IntegerField()
    answer = models.JSONField() 

    def __str__(self):
        return self.question_text[:50] + '...'

    class Meta:
        db_table = 'questions'
        ordering = ['quiz', 'order_index']
