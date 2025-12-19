from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from api.models.quiz import Quiz
from api.models.question import Question
from api.models.lesson import Lesson
from api.models.user_course import UserCourse
from api.serializers.quiz_serializers import QuestionSerializer


def check_lesson_access(user, lesson):
    """Helper: Kiểm tra user có quyền truy cập lesson không"""
    if user.is_staff or lesson.course.created_by == user:
        return True
    return UserCourse.objects.filter(
        user=user,
        course=lesson.course,
        status=UserCourse.Status.APPROVED
    ).exists()


def check_quiz_editor_access(user, quiz):
    """Helper: Kiểm tra user có quyền edit quiz không (admin hoặc tạo course)"""
    return user.is_staff or quiz.lesson.course.created_by == user


# ==================== QUESTION CRUD ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_question(request, quiz_id):
    """
    Tạo câu hỏi mới cho quiz.
    Chỉ admin hoặc người tạo khóa học mới có thể tạo.
    
    Body: {
        "question_text": "Từ 'phút' có nghĩa là gì?",
        "question_type": "multiple_choice|drag_drop|fill_in",
        "order_index": 1,
        "answer": {
            // Phụ thuộc vào loại câu hỏi
            "correct_option": 0,  // for multiple_choice
            "options": ["A", "B", "C"],
            
            // hoặc
            "pairs": [              // for drag_drop
                {"word": "apple", "definition": "quả táo"},
            ],
            
            // hoặc
            "correct_answer": "minute"  // for fill_in
        }
    }
    """
    quiz = get_object_or_404(Quiz, id=quiz_id)
    
    if not check_quiz_editor_access(request.user, quiz):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền thêm câu hỏi cho quiz này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data.copy()
    data['quiz'] = quiz.id
    
    serializer = QuestionSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
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
def get_question(request, question_id):
    """
    Lấy chi tiết một câu hỏi.
    """
    question = get_object_or_404(Question, id=question_id)
    
    if not check_lesson_access(request.user, question.quiz.lesson):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền truy cập câu hỏi này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = QuestionSerializer(question)
    return Response({
        'success': True,
        'data': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_questions(request, quiz_id):
    """
    Lấy danh sách câu hỏi của quiz.
    
    Query params:
    - include_answers: 'true' để hiển thị đáp án (chỉ editor)
    """
    quiz = get_object_or_404(Quiz, id=quiz_id)
    
    if not check_lesson_access(request.user, quiz.lesson):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền truy cập quiz này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    questions = Question.objects.filter(quiz=quiz).order_by('order_index')
    include_answers = request.query_params.get('include_answers', 'false').lower() == 'true'
    
    # Nếu không phải editor, không hiển thị đáp án
    if not check_quiz_editor_access(request.user, quiz):
        include_answers = False
    
    serialized_data = []
    for q in questions:
        data = {
            'id': q.id,
            'quiz': q.quiz_id,
            'question_text': q.question_text,
            'question_type': q.question_type,
            'order_index': q.order_index,
        }
        if include_answers:
            data['answer'] = q.answer
        serialized_data.append(data)
    
    return Response({
        'success': True,
        'data': {
            'quiz': {
                'id': quiz.id,
                'lesson_title': quiz.lesson.title,
            },
            'total': len(serialized_data),
            'include_answers': include_answers,
            'questions': serialized_data,
        }
    })


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_question(request, question_id):
    """
    Cập nhật câu hỏi.
    Chỉ admin hoặc người tạo khóa học mới có thể cập nhật.
    """
    question = get_object_or_404(Question, id=question_id)
    
    if not check_quiz_editor_access(request.user, question.quiz):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền cập nhật câu hỏi này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    is_partial = request.method == 'PATCH'
    serializer = QuestionSerializer(question, data=request.data, partial=is_partial)
    
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
def delete_question(request, question_id):
    """
    Xóa câu hỏi.
    Chỉ admin hoặc người tạo khóa học mới có thể xóa.
    """
    question = get_object_or_404(Question, id=question_id)
    
    if not check_quiz_editor_access(request.user, question.quiz):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền xóa câu hỏi này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    question_text = question.question_text[:50]
    question.delete()
    
    return Response({
        'success': True,
        'message': f'Xóa câu hỏi "{question_text}..." thành công.'
    })


# ==================== BULK OPERATIONS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_create_questions(request, quiz_id):
    """
    Tạo nhiều câu hỏi cùng một lúc.
    Chỉ admin hoặc người tạo khóa học mới có thể tạo.
    
    Body: {
        "questions": [
            {
                "question_text": "...",
                "question_type": "multiple_choice",
                "order_index": 1,
                "answer": {...}
            },
            ...
        ]
    }
    """
    quiz = get_object_or_404(Quiz, id=quiz_id)
    
    if not check_quiz_editor_access(request.user, quiz):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền thêm câu hỏi cho quiz này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    questions_data = request.data.get('questions', [])
    if not questions_data:
        return Response({
            'success': False,
            'error': 'Không có dữ liệu câu hỏi.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    created_questions = []
    errors = []
    
    for idx, data in enumerate(questions_data):
        data_copy = data.copy()
        data_copy['quiz'] = quiz.id
        
        serializer = QuestionSerializer(data=data_copy)
        if serializer.is_valid():
            serializer.save()
            created_questions.append(serializer.data)
        else:
            errors.append({
                'index': idx,
                'data': data,
                'errors': serializer.errors
            })
    
    return Response({
        'success': len(errors) == 0,
        'data': {
            'created_count': len(created_questions),
            'error_count': len(errors),
            'created_questions': created_questions,
            'errors': errors if errors else None,
        }
    }, status=status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reorder_questions(request, quiz_id):
    """
    Reorder lại các câu hỏi trong quiz.
    Chỉ admin hoặc người tạo khóa học mới có thể reorder.
    
    Body: {
        "question_orders": [
            {"question_id": 1, "order_index": 2},
            {"question_id": 2, "order_index": 1},
            ...
        ]
    }
    """
    quiz = get_object_or_404(Quiz, id=quiz_id)
    
    if not check_quiz_editor_access(request.user, quiz):
        return Response({
            'success': False,
            'error': 'Bạn không có quyền reorder câu hỏi cho quiz này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    orders = request.data.get('question_orders', [])
    if not orders:
        return Response({
            'success': False,
            'error': 'Không có dữ liệu reorder.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    errors = []
    updated_count = 0
    
    for item in orders:
        question_id = item.get('question_id')
        order_index = item.get('order_index')
        
        try:
            question = Question.objects.get(id=question_id, quiz=quiz)
            question.order_index = order_index
            question.save()
            updated_count += 1
        except Question.DoesNotExist:
            errors.append({
                'question_id': question_id,
                'error': 'Câu hỏi không tồn tại hoặc không thuộc quiz này.'
            })
    
    return Response({
        'success': len(errors) == 0,
        'data': {
            'updated_count': updated_count,
            'error_count': len(errors),
            'errors': errors if errors else None,
        }
    })
