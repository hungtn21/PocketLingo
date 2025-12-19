from django.db import models
from django.contrib.auth.hashers import check_password
import uuid

class UserManager(models.Manager):
    """Custom manager for User model"""
    
    def get_by_natural_key(self, username):
        """Get user by natural key (username/email)"""
        return self.get(email=username)


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
    email_notifications_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    def __str__(self):
        return self.email
    
    # Required properties for Django Auth compatibility
    @property
    def is_authenticated(self):
        """Always return True for authenticated users"""
        return True
    
    @property
    def is_anonymous(self):
        """Always return False for authenticated users"""
        return False
    
    @property
    def username(self):
        """Return name as username for compatibility"""
        return self.name
    
    @property
    def is_active(self):
        """Check if user is active"""
        return self.status == self.Status.ACTIVE
    
    @property
    def is_staff(self):
        """Check if user is staff (admin or superadmin)"""
        return self.role in [self.Role.ADMIN, self.Role.SUPERADMIN]
    
    @property
    def is_superuser(self):
        """Check if user is superuser"""
        return self.role == self.Role.SUPERADMIN
    
    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        return self.is_staff
    
    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        return self.is_staff
    
    def check_password(self, raw_password):
        """Check if the provided password matches the stored hash"""
        return check_password(raw_password, self.password_hash)
    
    # Required for Django Admin
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'     
