from django.db import models

class User(models.Model):
    class Role(models.TextChoices):
        LEARNER = 'learner', 'Học viên'
        ADMIN = 'admin', 'Quản trị viên'
        SUPERADMIN = 'superadmin', 'Super Admin'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Hoạt động'
        INACTIVE = 'inactive', 'Không hoạt động'

    id = models.BigAutoField(primary_key=True)
    name = models.TextField()
    email = models.CharField(max_length=255, unique=True)
    password_hash = models.TextField(blank=True, null=True) 
    role = models.CharField(max_length=10, choices=Role.choices, help_text="Vai trò của người dùng")
    status = models.CharField(max_length=8, choices=Status.choices, default=Status.ACTIVE)
    xp = models.BigIntegerField(default=0)
    avatar_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email
    
    class Meta:
        db_table = 'users'
