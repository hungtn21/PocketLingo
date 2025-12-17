# api/views/user_lesson_views.py

import random
import jwt
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Import Models
from api.models.lesson import Lesson
from api.models.flashcard import Flashcard
from api.models.quiz import Quiz
from api.models.question import Question
from api.models.user_flashcard import UserFlashcard
from api.models.user_lesson import UserLesson
from api.models.user_course import UserCourse
from api.models.user import User

# --- HELPER FUNCTIONS ---

def sanitize_question_answer(question: Question):
    """
    Remove correct answers and SHUFFLE options to prevent cheating.
    """
    data = question.answer or {}
    
    if question.question_type == Question.QuestionType.MULTIPLE_CHOICE:
        options = data.get('options', [])
        random.shuffle(options)
        return {'options': options}

    if question.question_type == Question.QuestionType.DRAG_DROP:
        pairs = data.get('correct_pairs', [])
        side_a = [p.get('side_a') for p in pairs]
        side_b = [p.get('side_b') for p in pairs]
        random.shuffle(side_b) 
        return {
            'side_a': side_a,
            'side_b': side_b
        }

    if question.question_type == Question.QuestionType.FILL_IN:
        return {'type': 'fill_in'}

    return {}

def get_user_from_token(request):
    """
    Lấy User Object từ Token. Trả về None nếu lỗi.
    """
    token = None
    auth_header = request.headers.get('Authorization')
    
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    
    if not token:
        token = request.COOKIES.get('jwt')

    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        # Quan trọng: Query lấy object User ngay tại đây
        if user_id:
            return User.objects.get(id=user_id)
        
        # Fallback: Nếu payload chỉ có email (trường hợp cũ)
        email = payload.get('email')
        if email:
            return User.objects.get(email=email)
            
    except Exception as e:
        return None
    return None

# --- MAIN VIEW ---

@api_view(['GET'])
def get_lesson_detail(request, lesson_id):
    # 1. Authentication
    user = get_user_from_token(request)
    
    if not user:
        return Response({'success': False, 'error': 'Chưa đăng nhập.'}, status=status.HTTP_401_UNAUTHORIZED)

    # 2. Get Lesson
    try:
        lesson = Lesson.objects.select_related('course').get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({'success': False, 'error': 'Bài học không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

    # 3. Check Authorization
    enrolled = UserCourse.objects.filter(
        user=user, 
        course=lesson.course, 
        status=UserCourse.Status.APPROVED
    ).exists()
    
    if not enrolled:
        return Response({'success': False, 'error': 'Bạn chưa đăng ký khóa học này.'}, status=status.HTTP_403_FORBIDDEN)

    # 4. Fetch Flashcards
    flashcards_qs = Flashcard.objects.filter(lesson=lesson).order_by('id')
    
    # Query - Tính status từ level thay vì lấy từ DB
    user_flashcards = UserFlashcard.objects.filter(
        user_id=user.id, 
        flashcard__in=flashcards_qs
    ).values('flashcard_id', 'level', 'next_review_date')
    
    user_flashcard_map = {uf['flashcard_id']: uf for uf in user_flashcards}

    flashcards_data = []
    for fc in flashcards_qs:
        uf_data = user_flashcard_map.get(fc.id)
        
        # Tính status từ level thay vì lấy từ DB
        # level >= 1 → đã nhớ, level == 0 hoặc None → chưa nhớ
        if uf_data:
            calculated_status = UserFlashcard.calculate_status(uf_data['level'])
        else:
            calculated_status = UserFlashcard.calculate_status(None) # Chưa học lần nào
        flashcards_data.append({
            'id': fc.id,
            'word': fc.word,
            'meaning': fc.meaning,
            'example': fc.example,
            'image_url': fc.image_url,
            'status': calculated_status,  
            'level': uf_data['level'] if uf_data else 0,
            'next_review_date': uf_data['next_review_date'] if uf_data else None,
        })

    # 5. Fetch Quiz
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
                'answer': sanitize_question_answer(q),
            })

    # 6. User Lesson Status
    user_lesson_data = {'bookmark': False, 'completed': False, 'completed_at': None}
    try:
        ul = UserLesson.objects.get(user_id=user.id, lesson=lesson)
        user_lesson_data = {
            'bookmark': ul.bookmark,
            'completed': ul.completed,
            'completed_at': ul.completed_at
        }
    except UserLesson.DoesNotExist:
        pass

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
                'user': user_lesson_data,
            },
            'flashcards': flashcards_data,
            'quiz': quiz_data,
            'questions': questions_data,
        }
    }, status=status.HTTP_200_OK)