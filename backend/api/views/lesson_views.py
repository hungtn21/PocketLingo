from api.models.user_course import UserCourse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from api.models.lesson import Lesson
from api.models.user_lesson import UserLesson
from api.models.quiz import Quiz
from api.models.quiz_attempt import QuizAttempt


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_lesson(request, lesson_id):
    """
    Mark a lesson as completed for the current user
    This should be called after user passes the quiz of the lesson
    The lesson is considered completed when user achieves the passed_score in the quiz
    """
    try:
        user = request.user
        
        # Check if lesson exists
        lesson = Lesson.objects.filter(id=lesson_id).first()
        if not lesson:
            return Response({
                'success': False,
                'message': 'Bài học không tồn tại'
            }, status=status.HTTP_404_NOT_FOUND)
        
        #Check if user is enrolled in the course of the lesson
        user_course = user.user_courses.filter(
            course=lesson.course,
            status=UserCourse.Status.APPROVED
        ).first()
        
        if not user_course:
            return Response({
                'success': False,
                'message': 'Bạn chưa đăng ký khóa học này.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get the quiz for this lesson
        quiz = Quiz.objects.filter(lesson_id=lesson_id).first()
        if not quiz:
            return Response({
                'success': False,
                'message': 'Bài học này không có quiz'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user has passed the quiz
        passed_attempt = QuizAttempt.objects.filter(
            user=user,
            quiz=quiz,
            status=QuizAttempt.Status.PASSED
        ).first()
        
        if not passed_attempt:
            return Response({
                'success': False,
                'message': 'Bạn chưa vượt qua bài quiz của bài học này'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user_lesson
        user_lesson, created = UserLesson.objects.get_or_create(
            user=user,
            lesson=lesson,
            defaults={'completed': True, 'completed_at': timezone.now()}
        )
        
        if not created and not user_lesson.completed:
            # Update if not already completed
            user_lesson.completed = True
            user_lesson.completed_at = timezone.now()
            user_lesson.save()
        
        return Response({
            'success': True,
            'message': 'Đã đánh dấu hoàn thành bài học',
            'data': {
                'lesson_id': lesson_id,
                'completed': True,
                'completed_at': user_lesson.completed_at
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
