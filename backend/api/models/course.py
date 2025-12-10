from django.db import models
from django.conf import settings

class Course(models.Model):
    class Language(models.TextChoices):
        JAPANESE = 'Japanese', 'Tiếng Nhật'
        ENGLISH = 'English', 'Tiếng Anh'
        VIETNAMESE = 'Vietnamese', 'Tiếng Việt'
    
    class Level(models.TextChoices):
        BEGINNER = 'Sơ cấp', 'Sơ cấp'
        INTERMEDIATE = 'Trung cấp', 'Trung cấp'
        ADVANCED = 'Cao cấp', 'Cao cấp'

    id = models.BigAutoField(primary_key=True)
    title = models.TextField()
    description = models.TextField()
    language = models.CharField(max_length=10, choices=Language.choices)
    level = models.CharField(max_length=10, choices=Level.choices, default=Level.BEGINNER)
    image_url = models.TextField(blank=True, null=True)
    
    created_by = models.ForeignKey(
        'User',  # Tham chiếu trực tiếp đến model User tùy chỉnh
        on_delete=models.SET_NULL, 
        null=True,
        blank=True,
        related_name='created_courses'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'courses'
