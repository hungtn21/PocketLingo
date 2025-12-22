from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from api.models.quiz import Quiz
from api.models.lesson import Lesson
from api.models.user_course import UserCourse
from api.models.quiz_attempt import QuizAttempt
from api.serializers.quiz_serializers import QuizSerializer, QuizDetailSerializer


def check_lesson_access(user, lesson):
    """Helper: Kiểm tra user có quyền truy cập lesson không"""
    if user.is_staff or lesson.course.created_by == user:
        return True
    return UserCourse.objects.filter(
        user=user,
        course=lesson.course,
        status__in=[UserCourse.Status.APPROVED, UserCourse.Status.COMPLETED]
    ).exists()


def check_quiz_editor_access(user, quiz):
    """Helper: Kiểm tra user có quyền edit quiz không (admin hoặc tạo course)"""
    return user.is_staff or quiz.lesson.course.created_by == user


def can_retake_quiz(user, quiz):
    """Helper: Kiểm tra user có thể làm lại quiz không (hiện tại cho phép làm lại vô hạn)"""
    return True


# ==================== QUIZ CRUD ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_quiz(request, lesson_id):
    """
    Tạo quiz mới cho bài học.
    Chỉ admin hoặc người tạo khóa học mới có thể tạo.
    
    Body: {
        "time_limit": 600,          // giây (optional)
        "passed_score": 70          // phần trăm
    }
    """
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Bài học không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if not (request.user.is_staff or lesson.course.created_by == request.user):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền tạo quiz cho bài học này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Kiểm tra xem lesson đã có quiz chưa
    if Quiz.objects.filter(lesson=lesson).exists():
        return Response({
            'success': False,
            'error': 'Bài học này đã có quiz. Chỉ được có 1 quiz trên mỗi bài học.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data = request.data.copy()
    data['lesson'] = lesson.id
    
    serializer = QuizSerializer(data=data)
    if serializer.is_valid():
        # QuizSerializer marks `lesson` as read-only, so pass the lesson instance
        # directly to save() so lesson_id is set on the created Quiz.
        serializer.save(lesson=lesson)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz(request, quiz_id):
    """
    Lấy chi tiết quiz (kèm danh sách câu hỏi).
    """
    quiz = get_object_or_404(Quiz, id=quiz_id)
    
    # Kiểm tra quyền truy cập
    if not check_lesson_access(request.user, quiz.lesson):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền truy cập quiz này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = QuizDetailSerializer(quiz)
    
    # Thêm thông tin về quiz attempt của user
    attempt_info = None
    if request.user.is_authenticated:
        total_attempts = QuizAttempt.objects.filter(user=request.user, quiz=quiz).count()
        can_retake = can_retake_quiz(request.user, quiz)
        
        last_attempt = QuizAttempt.objects.filter(
            user=request.user, 
            quiz=quiz
        ).order_by('-started_at').first()
        
        attempt_info = {
            'total_attempts': total_attempts,
            'can_retake': can_retake,
            'last_attempt': {
                'status': last_attempt.status,
                'score': float(last_attempt.score),
                'started_at': last_attempt.started_at,
                'submitted_at': last_attempt.submitted_at,
            } if last_attempt else None
        }
    
    return Response({
        'success': True,
        'data': {
            **serializer.data,
            'attempt_info': attempt_info,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_quizzes(request, lesson_id):
    """
    Lấy danh sách quiz của bài học.
    """
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Bài học không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if not check_lesson_access(request.user, lesson):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền truy cập bài học này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    quizzes = Quiz.objects.filter(lesson=lesson)
    serializer = QuizSerializer(quizzes, many=True)
    
    return Response({
        'success': True,
        'data': {
            'lesson': {
                'id': lesson.id,
                'title': lesson.title,
            },
            'total': quizzes.count(),
            'quizzes': serializer.data,
        }
    })


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_quiz(request, quiz_id):
    """
    Cập nhật thông tin quiz.
    Chỉ admin hoặc người tạo khóa học mới có thể cập nhật.
    
    Body: {
        "time_limit": 600,
        "passed_score": 70
    }
    """
    quiz = get_object_or_404(Quiz, id=quiz_id)
    
    if not check_quiz_editor_access(request.user, quiz):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền cập nhật quiz này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    is_partial = request.method == 'PATCH'
    serializer = QuizSerializer(quiz, data=request.data, partial=is_partial)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_quiz(request, quiz_id):
    """
    Xóa quiz.
    Chỉ admin hoặc người tạo khóa học mới có thể xóa.
    Xóa quiz sẽ xóa tất cả câu hỏi và attempts của quiz đó.
    """
    quiz = get_object_or_404(Quiz, id=quiz_id)
    
    if not check_quiz_editor_access(request.user, quiz):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền xóa quiz này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    lesson_title = quiz.lesson.title
    quiz.delete()
    
    return Response({
        'success': True,
        'message': f'Xóa quiz của bài "{lesson_title}" thành công.'
    })
