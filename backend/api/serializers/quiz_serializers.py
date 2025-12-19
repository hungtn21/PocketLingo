from rest_framework import serializers
from api.models.quiz import Quiz
from api.models.question import Question


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'quiz', 'question_text', 'question_type', 'order_index', 'answer']
        read_only_fields = ['id']


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'lesson', 'time_limit', 'passed_score', 'created_at']
        read_only_fields = ['id', 'lesson', 'created_at']


class QuizDetailSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    course_title = serializers.CharField(source='lesson.course.title', read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    total_questions = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = ['id', 'lesson', 'lesson_title', 'course_title', 'time_limit', 'passed_score', 'total_questions', 'questions', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_total_questions(self, obj):
        return obj.questions.count()
