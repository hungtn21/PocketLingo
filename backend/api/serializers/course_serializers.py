from rest_framework import serializers
from ..models.course import Course
from ..models.lesson import Lesson

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'order_index', 'status', 'created_at', 'updated_at']

class CourseSerializer(serializers.ModelSerializer):
    lesson_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'language', 'level', 'image_url', 'lesson_count', 'created_at', 'updated_at']
