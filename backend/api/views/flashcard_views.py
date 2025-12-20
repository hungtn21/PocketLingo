from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import models

from api.models.flashcard import Flashcard
from api.models.lesson import Lesson
from api.models.user_course import UserCourse
from api.serializers.flashcard_serializers import FlashcardSerializer, FlashcardDetailSerializer


def check_lesson_access(user, lesson):
    """Helper: Kiểm tra user có quyền truy cập lesson không"""
    # Nếu là admin hoặc người tạo khóa học
    if user.is_staff or lesson.course.created_by == user:
        return True
    # Nếu đã đăng ký khóa học
    return UserCourse.objects.filter(
        user=user,
        course=lesson.course,
        status=UserCourse.Status.APPROVED
    ).exists()


# ==================== CREATE ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_flashcard(request, lesson_id):
    """
    Tạo flashcard mới cho bài học.
    Chỉ admin hoặc người tạo khóa học mới có thể tạo.
    
    Body: {
        "word": "phút",
        "meaning": "minute",
        "example": "Chờ tôi một phút",
        "image_url": "https://example.com/image.jpg"
    }
    """
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Bài học không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Kiểm tra quyền: chỉ admin hoặc người tạo khóa học
    if not (request.user.is_staff or lesson.course.created_by == request.user):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền tạo flashcard cho bài học này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = FlashcardSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(lesson=lesson)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ==================== READ ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_flashcards(request, lesson_id):
    """
    Lấy danh sách flashcards của bài học.
    
    Query params:
    - limit: số lượng (default 50)
    - offset: vị trí bắt đầu (default 0)
    - search: tìm kiếm theo từ hoặc meaning
    """
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Bài học không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Kiểm tra quyền truy cập
    if not check_lesson_access(request.user, lesson):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền truy cập bài học này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Lấy flashcards
    flashcards = Flashcard.objects.filter(lesson=lesson)
    
    # Tìm kiếm
    search = request.query_params.get('search', '').strip()
    if search:
        flashcards = flashcards.filter(
            models.Q(word__icontains=search) | models.Q(meaning__icontains=search)
        )
    
    # Pagination
    limit = int(request.query_params.get('limit', 50))
    offset = int(request.query_params.get('offset', 0))
    total = flashcards.count()
    flashcards = flashcards.order_by('id')[offset:offset+limit]
    
    serializer = FlashcardDetailSerializer(
        flashcards, 
        many=True,
        context={'request': request}
    )
    
    return Response({
        'success': True,
        'data': {
            'lesson': {
                'id': lesson.id,
                'title': lesson.title,
                'course_title': lesson.course.title,
            },
            'total': total,
            'limit': limit,
            'offset': offset,
            'flashcards': serializer.data,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_flashcard(request, flashcard_id):
    """
    Lấy chi tiết một flashcard.
    """
    flashcard = get_object_or_404(Flashcard, id=flashcard_id)
    
    # Kiểm tra quyền truy cập
    if not check_lesson_access(request.user, flashcard.lesson):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền truy cập flashcard này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = FlashcardDetailSerializer(
        flashcard,
        context={'request': request}
    )
    
    return Response({
        'success': True,
        'data': serializer.data
    })


# ==================== UPDATE ====================

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_flashcard(request, flashcard_id):
    """
    Cập nhật flashcard.
    Chỉ admin hoặc người tạo khóa học mới có thể cập nhật.
    
    Body: {
        "word": "phút",
        "meaning": "minute",
        "example": "Chờ tôi một phút",
        "image_url": "https://example.com/image.jpg"
    }
    """
    flashcard = get_object_or_404(Flashcard, id=flashcard_id)
    
    # Kiểm tra quyền: chỉ admin hoặc người tạo khóa học
    if not (request.user.is_staff or flashcard.lesson.course.created_by == request.user):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền cập nhật flashcard này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    is_partial = request.method == 'PATCH'
    serializer = FlashcardSerializer(
        flashcard, 
        data=request.data,
        partial=is_partial
    )
    
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


# ==================== DELETE ====================

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_flashcard(request, flashcard_id):
    """
    Xóa flashcard.
    Chỉ admin hoặc người tạo khóa học mới có thể xóa.
    """
    flashcard = get_object_or_404(Flashcard, id=flashcard_id)
    
    # Kiểm tra quyền: chỉ admin hoặc người tạo khóa học
    if not (request.user.is_staff or flashcard.lesson.course.created_by == request.user):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền xóa flashcard này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    lesson_id = flashcard.lesson.id
    flashcard.delete()
    
    return Response({
        'success': True,
        'message': f'Xóa flashcard thành công.'
    })


# ==================== BULK OPERATIONS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_create_flashcards(request, lesson_id):
    """
    Tạo nhiều flashcards cùng một lúc.
    Chỉ admin hoặc người tạo khóa học mới có thể tạo.
    
    Body: {
        "flashcards": [
            {"word": "phút", "meaning": "minute", "example": "...", "image_url": "..."},
            {"word": "giờ", "meaning": "hour", "example": "...", "image_url": "..."},
        ]
    }
    """
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Bài học không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Kiểm tra quyền
    if not (request.user.is_staff or lesson.course.created_by == request.user):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền tạo flashcard cho bài học này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    flashcards_data = request.data.get('flashcards', [])
    if not flashcards_data:
        return Response({
            'success': False,
            'error': 'Không có dữ liệu flashcard.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    created_flashcards = []
    errors = []
    
    for idx, data in enumerate(flashcards_data):
        serializer = FlashcardSerializer(data=data)
        if serializer.is_valid():
            serializer.save(lesson=lesson)
            created_flashcards.append(serializer.data)
        else:
            errors.append({
                'index': idx,
                'data': data,
                'errors': serializer.errors
            })
    
    return Response({
        'success': len(errors) == 0,
        'data': {
            'created_count': len(created_flashcards),
            'error_count': len(errors),
            'created_flashcards': created_flashcards,
            'errors': errors if errors else None,
        }
    }, status=status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS)
