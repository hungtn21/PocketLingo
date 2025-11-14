from django.db import models

class Lesson(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Hoạt động'
        INACTIVE = 'inactive', 'Không hoạt động'

    id = models.BigAutoField(primary_key=True)
    course = models.ForeignKey(
        'Course',  # Dùng tên model dưới dạng chuỗi
        on_delete=models.CASCADE,
        related_name='lessons'
    )
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    order_index = models.IntegerField()
    status = models.CharField(max_length=8, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    class Meta:
        db_table = 'lessons'
        ordering = ['course', 'order_index']
