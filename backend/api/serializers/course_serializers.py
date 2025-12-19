from rest_framework import serializers
from ..models.course import Course
from ..models.lesson import Lesson

class LessonSerializer(serializers.ModelSerializer):
    flashcard_count = serializers.SerializerMethodField()
    quiz_question_count = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'order_index', 'status', 'created_at', 'updated_at', 'flashcard_count', 'quiz_question_count']

    def get_flashcard_count(self, obj):
        return obj.flashcards.count()

    def get_quiz_question_count(self, obj):
        quiz = getattr(obj, 'quizzes', None)
        if quiz.exists():
            return quiz.first().questions.count()
        return 0

class CourseSerializer(serializers.ModelSerializer):
    lesson_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'language', 'level', 'image_url', 'lesson_count', 'created_at', 'updated_at']
