from django.contrib import admin
from api.models.course import Course
from api.models.lesson import Lesson
from api.models.user_course import UserCourse

# Register your models here.
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'language', 'level', 'created_at']
    list_filter = ['language', 'level']
    search_fields = ['title', 'description']

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'course', 'order_index', 'status']
    list_filter = ['course', 'status']
    search_fields = ['title', 'description']

@admin.register(UserCourse)
class UserCourseAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'course', 'status', 'requested_at', 'rating']
    list_filter = ['status', 'rating']
