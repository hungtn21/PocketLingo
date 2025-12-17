from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from ..models.user import User
import cloudinary
import cloudinary.uploader
import cloudinary.api

class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(write_only=True, required=False)
    total_words_learned = serializers.SerializerMethodField()
    total_quizzes_taken = serializers.SerializerMethodField()
    courses_progress = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['name', 'email', 'avatar_url', 'avatar', 'role', 'total_words_learned', 'total_quizzes_taken', 'courses_progress']
    
    def get_total_words_learned(self, obj):
        """Đếm số từ đã học (UserFlashcard có level >= 1)"""
        from ..models.user_flashcard import UserFlashcard
        return UserFlashcard.objects.filter(user=obj, level__gte=1).count()
    
    def get_total_quizzes_taken(self, obj):
        """Đếm số quiz đã làm"""
        from ..models.quiz_attempt import QuizAttempt
        return QuizAttempt.objects.filter(user=obj).count()
    
    def get_courses_progress(self, obj):
        """Đếm tiến độ các khóa học đã đăng ký"""
        from ..models.user_course import UserCourse
        from ..models.lesson import Lesson
        from ..models.user_lesson import UserLesson
        from ..models.quiz_attempt import QuizAttempt
        from ..models.quiz import Quiz
        from django.db.models import Avg
        
        # Lấy tất cả khóa học đã approved
        user_courses = UserCourse.objects.filter(
            user=obj, 
            status=UserCourse.Status.APPROVED
        ).select_related('course')
        
        courses_data = []
        for uc in user_courses:
            course = uc.course
            # Đếm tổng số bài học trong khóa
            total_lessons = Lesson.objects.filter(course=course).count()
            
            if total_lessons > 0:
                # Đếm số bài học đã hoàn thành
                completed_lessons = UserLesson.objects.filter(
                    user=obj,
                    lesson__course=course,
                    completed=True
                ).count()
                
                progress = round((completed_lessons / total_lessons) * 100, 1)
            else:
                progress = 0
            
            # Tính điểm trung bình quiz của khóa học
            quiz_avg = QuizAttempt.objects.filter(
                user=obj,
                quiz__lesson__course=course
            ).aggregate(avg_score=Avg('score'))['avg_score']
            
            average_quiz_score = round(quiz_avg, 1) if quiz_avg is not None else 0
            
            courses_data.append({
                'course_id': course.id,
                'course_name': course.title,
                'course_image': course.image_url,
                'progress': progress,
                'completed_lessons': completed_lessons if total_lessons > 0 else 0,
                'total_lessons': total_lessons,
                'average_quiz_score': average_quiz_score
            })
        
        return courses_data

    def update(self, instance, validated_data):
        avatar = validated_data.pop('avatar', None)

        # Nếu user upload avatar mới thì lưu lên Cloudinary
        if avatar:
            upload = cloudinary.uploader.upload(avatar)
            instance.avatar_url = upload.get("secure_url")

        return super().update(instance, validated_data)

class LearnerListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'status', 'xp', 'avatar_url', 'created_at']

class AdminListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'status', 'avatar_url', 'created_at']

