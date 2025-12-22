from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from api.models.lesson import Lesson
from api.models.flashcard import Flashcard
from api.models.user_flashcard import UserFlashcard
from api.models.user_course import UserCourse
from api.models.user_lesson import UserLesson


def check_enrollment(user, course):
    """Helper: Kiểm tra user đã enroll khóa học chưa."""
    return UserCourse.objects.filter(
        user=user,
        course=course,
        status__in=[UserCourse.Status.APPROVED, UserCourse.Status.COMPLETED]
    ).exists()


# ==================== LESSON STUDY ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lesson_study_info(request, lesson_id):
    """
    Lấy thông tin học tập của lesson.
    Hiển thị ở trang chi tiết bài học.
    """
    user = request.user
    
    # 1. Validate lesson
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Bài học không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # 2. Check enrollment
    if not check_enrollment(user, lesson.course):
        return Response({
            'success': False,
            'error': 'Bạn chưa đăng ký khóa học này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # 3. Get progress
    progress = UserFlashcard.get_lesson_progress(user, lesson)
    unlearned_count = progress['total'] - progress['learned']
    
    return Response({
        'success': True,
        'data': {
            'lesson': {
                'id': lesson.id,
                'title': lesson.title,
                'course_title': lesson.course.title,
            },
            'progress': progress,
            'can_learn_new': unlearned_count > 0,
            'unlearned_count': unlearned_count,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_learn_new_session(request, lesson_id):
    """
    Lấy flashcard để HỌC MỚI (lần đầu).
    Chỉ trả về các từ chưa học.
    """
    user = request.user
    
    # 1. Validate
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Bài học không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if not check_enrollment(user, lesson.course):
        return Response({
            'success': False,
            'error': 'Bạn chưa đăng ký khóa học này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # 2. Get unlearned flashcards
    flashcards = UserFlashcard.get_unlearned_cards(user, lesson)
    
    if not flashcards.exists():
        return Response({
            'success': True,
            'data': {
                'lesson': {
                    'id': lesson.id,
                    'title': lesson.title,
                },
                'mode': 'learn_new',
                'total': 0,
                'flashcards': [],
                'message': 'Bạn đã học hết tất cả từ trong bài này. Hãy chuyển sang luyện tập!',
                'redirect': 'practice'
            }
        }, status=status.HTTP_200_OK)
    
    # 3. Format response
    flashcards_data = [
        {
            'id': fc.id,
            'word': fc.word,
            'meaning': fc.meaning,
            'example': fc.example,
            'image_url': fc.image_url,
        }
        for fc in flashcards
    ]
    
    return Response({
        'success': True,
        'data': {
            'lesson': {
                'id': lesson.id,
                'title': lesson.title,
            },
            'mode': 'learn_new',
            'total': len(flashcards_data),
            'flashcards': flashcards_data,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_practice_session(request, lesson_id):
    """
    Lấy flashcard để LUYỆN TẬP TỰ DO.
    Trả về TẤT CẢ từ trong bài (không ảnh hưởng DB).
    """
    user = request.user
    
    # 1. Validate
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Bài học không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if not check_enrollment(user, lesson.course):
        return Response({
            'success': False,
            'error': 'Bạn chưa đăng ký khóa học này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # 2. Get ALL flashcards
    flashcards = Flashcard.objects.filter(lesson=lesson).order_by('id')
    
    if not flashcards.exists():
        return Response({
            'success': False,
            'error': 'Bài học này chưa có flashcard.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 3. Get user progress for display (optional)
    user_flashcard_map = {
        uf.flashcard_id: uf
        for uf in UserFlashcard.objects.filter(user=user, flashcard__lesson=lesson)
    }
    
    flashcards_data = [
        {
            'id': fc.id,
            'word': fc.word,
            'meaning': fc.meaning,
            'example': fc.example,
            'image_url': fc.image_url,
            'level': user_flashcard_map.get(fc.id).level if fc.id in user_flashcard_map else None,
        }
        for fc in flashcards
    ]
    
    return Response({
        'success': True,
        'data': {
            'lesson': {
                'id': lesson.id,
                'title': lesson.title,
            },
            'mode': 'practice',
            'note': 'Chế độ luyện tập tự do - không ảnh hưởng tiến độ',
            'total': len(flashcards_data),
            'flashcards': flashcards_data,
        }
    })


# ==================== SUBMIT RESULTS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_learn_new_results(request, lesson_id):
    """
    Ghi nhận kết quả HỌC MỚI.
    Tạo UserFlashcard records mới.
    
    Body: {
        "results": [
            {"flashcard_id": 1, "remembered": true},
            {"flashcard_id": 2, "remembered": false},
            ...
        ]
    }
    """
    user = request.user
    results = request.data.get('results', [])
    
    # 1. Validate
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Bài học không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if not check_enrollment(user, lesson.course):
        return Response({
            'success': False,
            'error': 'Bạn chưa đăng ký khóa học này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    if not results:
        return Response({
            'success': False,
            'error': 'Không có kết quả để ghi nhận.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 2. Process results
    remembered_count = 0
    not_remembered_count = 0
    
    for item in results:
        flashcard_id = item.get('flashcard_id')
        remembered = item.get('remembered', False)
        
        try:
            flashcard = Flashcard.objects.get(id=flashcard_id, lesson=lesson)
            UserFlashcard.create_from_first_learn(user, flashcard, remembered)
            
            if remembered:
                remembered_count += 1
            else:
                not_remembered_count += 1
                
        except Flashcard.DoesNotExist:
            continue  # Skip invalid flashcard
    
    # 3. Award XP for first learn
    xp_gained = 40
    user.xp = (user.xp or 0) + xp_gained
    user.save()
    
    # 4. Update UserLesson
    user_lesson, _ = UserLesson.objects.get_or_create(
        user=user,
        lesson=lesson
    )
    if not user_lesson.flashcard_completed:
        user_lesson.flashcard_completed = True
        user_lesson.flashcard_completed_at = timezone.now()
        user_lesson.save()
    
    return Response({
        'success': True,
        'data': {
            'remembered_count': remembered_count,
            'not_remembered_count': not_remembered_count,
            'xp_gained': xp_gained,
            'total_xp': user.xp,
            'message': f'Đã học {remembered_count + not_remembered_count} từ mới!'
        }
    })


# ==================== AI EXPLAIN ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_explain_flashcard(request):
    """Gọi AI giải thích flashcard."""
    from api.ai.flashcard_explain import generate_flashcard_explanation
    
    word = request.data.get('word', '').strip()
    meaning = request.data.get('meaning', '').strip()
    user_question = request.data.get('user_question', '').strip()
    
    if not word or not meaning:
        return Response({
            'success': False,
            'error': 'Thiếu thông tin từ vựng.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        explanation = generate_flashcard_explanation(word, meaning, user_question)
        return Response({
            'success': True,
            'data': {
                'word': word,
                'meaning': meaning,
                'explanation': explanation,
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': 'Lỗi khi gọi AI. Vui lòng thử lại.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
