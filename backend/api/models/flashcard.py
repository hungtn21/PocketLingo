from django.db import models

class Flashcard(models.Model):
    id = models.BigAutoField(primary_key=True)
    lesson = models.ForeignKey(
        'Lesson', # Dùng tên model dưới dạng chuỗi
        on_delete=models.CASCADE, 
        related_name='flashcards'
    )
    word = models.TextField()
    meaning = models.TextField()
    example = models.TextField(blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.word

    class Meta:
        db_table = 'flashcards'
