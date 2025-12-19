from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models.lesson import Lesson
from api.models.flashcard import Flashcard
from api.models.quiz import Quiz
from api.models.question import Question
from api.models.user import User


def _require_admin(user):
    """Kiểm tra user có phải admin/superadmin không"""
    return getattr(user, 'role', None) in (User.Role.ADMIN, User.Role.SUPERADMIN)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_lesson_detail(request, lesson_id):
    """
    Lấy chi tiết bài học bao gồm:
    - Thông tin bài học
    - Danh sách flashcards
    - Thông tin quiz và danh sách câu hỏi (nếu có)
    1. Chỉ admin/superadmin mới có quyền truy cập.
    2. Trả về chi tiết bài học, flashcards, quiz và câu hỏi.
    3. Nếu bài học không tồn tại, trả về lỗi 404.
    """
    # 1. Check admin permission
    if not _require_admin(request.user):
        return Response(
            {'success': False, 'error': 'Bạn không có quyền truy cập.'}, 
            status=status.HTTP_403_FORBIDDEN
        )

    # 2. Get Lesson
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response(
            {'success': False, 'error': 'Bài học không tồn tại.'}, 
            status=status.HTTP_404_NOT_FOUND
        )

    # 3. Fetch Flashcards
    flashcards_qs = Flashcard.objects.filter(lesson=lesson).order_by('id')
    flashcards_data = [
        {
            'id': fc.id,
            'word': fc.word,
            'meaning': fc.meaning,
            'example': fc.example,
            'image_url': fc.image_url,
        }
        for fc in flashcards_qs
    ]

    # 4. Fetch Quiz
    quiz = Quiz.objects.filter(lesson=lesson).first()
    quiz_data = None
    questions_data = []
    
    if quiz:
        quiz_data = {
            'id': quiz.id,
            'time_limit': quiz.time_limit,
            'passed_score': quiz.passed_score,
        }
        questions = Question.objects.filter(quiz=quiz).order_by('order_index')
        for q in questions:
            questions_data.append({
                'id': q.id,
                'question_text': q.question_text,
                'question_type': q.question_type,
                'order_index': q.order_index,
                'answer': q.answer,
            })

    return Response({
        'success': True,
        'data': {
            'lesson': {
                'id': lesson.id,
                'course_id': lesson.course_id,
                'course_title': lesson.course.title,
                'title': lesson.title,
                'description': lesson.description,
                'order_index': lesson.order_index,
                'status': lesson.status,
            },
            'flashcards': flashcards_data,
            'quiz': quiz_data,
            'questions': questions_data,
        }
    }, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_admin_lesson(request, lesson_id):
    """Cập nhật thông tin bài học (chỉ dành cho admin/superadmin).

    Cho phép chỉnh sửa:
    - title
    - description
    - order_index
    - status (active/inactive)
    """

    # 1. Check admin permission
    if not _require_admin(request.user):
        return Response(
            {'success': False, 'error': 'Bạn không có quyền truy cập.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # 2. Get Lesson
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response(
            {'success': False, 'error': 'Bài học không tồn tại.'},
            status=status.HTTP_404_NOT_FOUND
        )

    data = request.data or {}

    title = data.get('title')
    description = data.get('description')
    order_index = data.get('order_index')
    status_value = data.get('status')

    errors = {}

    if title is not None:
        title_str = str(title).strip()
        if not title_str:
            errors['title'] = 'Tên bài học không được để trống.'
        else:
            lesson.title = title_str

    if description is not None:
        lesson.description = description

    if order_index is not None:
        try:
            new_order_index = int(order_index)
        except (TypeError, ValueError):
            errors['order_index'] = 'Thứ tự bài học phải là số nguyên.'
        else:
            # Kiểm tra trùng thứ tự với BÀI HỌC ĐANG HOẠT ĐỘNG trong cùng khóa học (trừ chính bài hiện tại)
            if Lesson.objects.filter(
                course=lesson.course,
                order_index=new_order_index,
                status=Lesson.Status.ACTIVE,
            ).exclude(id=lesson.id).exists():
                errors['order_index'] = 'Trong khóa học này đã có bài học hoạt động dùng thứ tự này.'
            else:
                lesson.order_index = new_order_index

    if status_value is not None:
        if status_value not in [Lesson.Status.ACTIVE, Lesson.Status.INACTIVE]:
            errors['status'] = 'Trạng thái không hợp lệ.'
        else:
            lesson.status = status_value

    if errors:
        return Response({'success': False, 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    lesson.save()

    return Response({
        'success': True,
        'data': {
            'lesson': {
                'id': lesson.id,
                'course_id': lesson.course_id,
                'course_title': lesson.course.title,
                'title': lesson.title,
                'description': lesson.description,
                'order_index': lesson.order_index,
                'status': lesson.status,
            }
        }
    }, status=status.HTTP_200_OK)
