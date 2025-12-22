from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django.db import transaction
from api.models.lesson import Lesson
from api.models.quiz import Quiz
from api.models.question import Question
from api.models.quiz_attempt import QuizAttempt
from api.models.user import User
from api.models.user_lesson import UserLesson


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lesson_quiz(request, lesson_id):
    """
    Lấy thông tin quiz và danh sách câu hỏi cho một bài học
    GET /lessons/{lesson_id}/quiz
    """
    try:
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Lấy quiz của bài học (giả sử mỗi bài học có 1 quiz)
        quiz = Quiz.objects.filter(lesson=lesson).first()
        
        if not quiz:
            return Response(
                {"error": "Bài học này chưa có quiz"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Lấy danh sách câu hỏi
        questions = Question.objects.filter(quiz=quiz).order_by('order_index')
        
        # Chuẩn bị dữ liệu câu hỏi (không bao gồm đáp án đúng)
        questions_data = []
        for question in questions:
            question_data = {
                "question_id": question.id,
                "type": question.question_type,
                "content": question.question_text,
                "order_index": question.order_index,
            }
            
            # Xử lý answers theo từng loại câu hỏi
            if question.question_type == 'multiple_choice':
                # Chỉ gửi options, không gửi correct_answer
                raw_options = question.answer.get("options", [])
                # Chuyển đổi thành format {id: "A", text: "..."}
                formatted_options = []
                for idx, opt in enumerate(raw_options):
                    # Generate ID: 0->A, 1->B, 2->C, 3->D...
                    opt_id = chr(65 + idx) 
                    formatted_options.append({"id": opt_id, "text": opt})
                question_data["options"] = formatted_options
                
            elif question.question_type == 'drag_drop':
                # Chỉ gửi các items để kéo thả, không gửi correct_pairs
                # Admin lưu là "pairs" với "left"/"right", nhưng code cũ dùng "correct_pairs" với "side_a"/"side_b"
                # Ưu tiên dùng "pairs" nếu có
                pairs = question.answer.get("pairs", [])
                if not pairs:
                    # Fallback cho dữ liệu cũ
                    correct_pairs = question.answer.get("correct_pairs", [])
                    side_a_items = [pair["side_a"] for pair in correct_pairs]
                    side_b_items = [pair["side_b"] for pair in correct_pairs]
                else:
                    side_a_items = [pair["left"] for pair in pairs]
                    side_b_items = [pair["right"] for pair in pairs]
                
                # Shuffle để người dùng không đoán được thứ tự
                import random
                # Copy để không ảnh hưởng list gốc nếu cần
                shuffled_b = list(side_b_items)
                random.shuffle(shuffled_b)
                
                question_data["side_a_items"] = side_a_items
                question_data["side_b_items"] = shuffled_b
                
            elif question.question_type == 'fill_in':
                # Không gửi accepted_answers
                pass
            
            questions_data.append(question_data)
        
        response_data = {
            "quiz_id": quiz.id,
            "lesson_id": lesson.id,
            "lesson_title": lesson.title,
            "time_limit": quiz.time_limit,  # Thời gian tính bằng giây
            "passed_score": quiz.passed_score,
            "total_questions": questions.count(),
            "questions": questions_data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, lesson_id):
    """
    Nộp bài quiz và chấm điểm
    POST /lessons/{lesson_id}/quiz/submit
    """
    try:
        user = request.user
        
        # Defensive: ensure we have a fresh User instance from database
        print(f"DEBUG: request.user type: {type(user)}, value: {user}, is User instance: {isinstance(user, User)}")
        print(f"DEBUG: request.user id: {getattr(user, 'id', 'NO ID')}, pk: {getattr(user, 'pk', 'NO PK')}")
        
        # Always reload user from database to ensure it's a proper instance
        try:
            user_id = user.id if hasattr(user, 'id') else user.pk
            user = User.objects.get(id=user_id)
            print(f"DEBUG: Successfully reloaded User from DB: {user.email} (ID: {user.id})")
        except (AttributeError, User.DoesNotExist) as e:
            print(f"DEBUG: Failed to reload user: {e}")
            return Response({
                'error': 'Không tìm thấy người dùng trong hệ thống.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        quiz_id = request.data.get('quiz_id')
        user_answers = request.data.get('answers', [])
        
        if not quiz_id:
            return Response(
                {"error": "quiz_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quiz = get_object_or_404(Quiz, id=quiz_id, lesson_id=lesson_id)
        questions = Question.objects.filter(quiz=quiz)
        
        # Tính điểm
        total_questions = questions.count()
        correct_count = 0
        
        # Tạo dict để tra cứu nhanh câu trả lời của user
        user_answers_dict = {}
        for ans in user_answers:
            if 'question_id' in ans and 'answer' in ans:
                user_answers_dict[ans['question_id']] = ans['answer']
        
        for question in questions:
            user_answer = user_answers_dict.get(question.id)
            
            # Bỏ qua nếu không có câu trả lời
            if user_answer is None or user_answer == "":
                continue
            
            try:
                if question.question_type == 'multiple_choice':
                    # Admin lưu correct_option là index (0, 1, 2...)
                    correct_option_idx = question.answer.get("correct_option", 0)
                    options = question.answer.get("options", [])
                    
                    # Convert user answer "A" -> 0, "B" -> 1
                    if isinstance(user_answer, str) and len(user_answer) == 1:
                        user_answer_idx = ord(user_answer.upper()) - 65
                        if 0 <= user_answer_idx < len(options) and user_answer_idx == correct_option_idx:
                            correct_count += 1
                    # Fallback: nếu user_answer là số
                    elif isinstance(user_answer, int) and user_answer == correct_option_idx:
                        correct_count += 1
                        
                elif question.question_type == 'drag_drop':
                    # Admin lưu "pairs" với "left"/"right"
                    pairs = question.answer.get("pairs", [])
                    if not pairs:
                        # Fallback cũ
                        correct_pairs = question.answer.get("correct_pairs", [])
                        pairs = [
                            {"left": pair.get("side_a", ""), "right": pair.get("side_b", "")}
                            for pair in correct_pairs
                        ]
                    
                    # Tạo dict correct từ pairs
                    correct_dict = {pair.get("left", ""): pair.get("right", "") for pair in pairs}
                    
                    # So sánh user_answer với correct_dict
                    if isinstance(user_answer, dict) and user_answer == correct_dict:
                        correct_count += 1
                        
                elif question.question_type == 'fill_in':
                    # Admin lưu "accepted_answers"
                    accepted_answers = question.answer.get("accepted_answers", [])
                    if not accepted_answers:
                        # Fallback cũ
                        text_answer = question.answer.get("text", "")
                        if text_answer:
                            accepted_answers = [text_answer]
                    
                    # So sánh không phân biệt hoa thường và khoảng trắng
                    if isinstance(user_answer, str) and user_answer.strip():
                        user_answer_normalized = user_answer.strip().lower()
                        accepted_normalized = [str(ans).strip().lower() for ans in accepted_answers]
                        if user_answer_normalized in accepted_normalized:
                            correct_count += 1
            except (KeyError, AttributeError, TypeError) as e:
                # Log lỗi nhưng tiếp tục chấm câu khác
                print(f"Error grading question {question.id}: {str(e)}")
                continue
        
        # Tính điểm phần trăm
        score = (correct_count / total_questions * 100) if total_questions > 0 else 0
        quiz_status = QuizAttempt.Status.PASSED if score >= quiz.passed_score else QuizAttempt.Status.FAILED
        
        # Lấy số lần làm bài
        previous_attempts = QuizAttempt.objects.filter(
            quiz=quiz,
            user_id=user.id
        ).count()
        
        # ==================== XP LOGIC (Quiz completion) ====================
        # 1) Init
        xp_gained = 0

        # 2) Quiz reward (effort & accuracy)
        is_perfect = total_questions > 0 and correct_count == total_questions
        is_passed = quiz_status == QuizAttempt.Status.PASSED
        if is_perfect:
            xp_gained += 100
        elif is_passed:
            xp_gained += 50

        milestone_awarded = False

        # 5) Persist everything atomically
        with transaction.atomic():
            # Lock user row to avoid XP race conditions
            user = User.objects.select_for_update().get(id=user.id)

            # Save attempt
            quiz_attempt = QuizAttempt.objects.create(
                quiz=quiz,
                user=user,
                quiz_answers=user_answers,
                status=quiz_status,
                score=score,
                submitted_at=timezone.now(),
                attempt_no=previous_attempts + 1,
            )

            lesson = quiz.lesson

            # Ensure UserLesson exists (also used for flashcard completion milestone)
            user_lesson = (
                UserLesson.objects.select_for_update()
                .filter(user=user, lesson=lesson)
                .first()
            )
            if not user_lesson:
                user_lesson = UserLesson.objects.create(
                    user=user,
                    lesson=lesson,
                    completed=is_passed,
                    completed_at=timezone.now() if is_passed else None,
                )

            # If passed, mark lesson completed
            if is_passed and not user_lesson.completed:
                user_lesson.completed = True
                user_lesson.completed_at = timezone.now()

            # 3) Milestone reward (lesson completion)
            # Condition: flashcard session done AND quiz passed AND not already rewarded
            if (
                is_passed
                and user_lesson.flashcard_completed
                and not user_lesson.milestone_xp_awarded
            ):
                xp_gained += 100
                user_lesson.milestone_xp_awarded = True
                milestone_awarded = True

            # Save UserLesson changes if any
            user_lesson.save()

            # Update user XP
            if xp_gained:
                user.xp = (user.xp or 0) + xp_gained
                user.save(update_fields=['xp'])
        
        return Response({
            "attempt_id": quiz_attempt.id,
            "score": score,
            "correct_count": correct_count,
            "total_questions": total_questions,
            "status": quiz_status,
            "passed_score": quiz.passed_score,
            "xp_gained": xp_gained,
            "milestone_awarded": milestone_awarded,
            "total_xp": user.xp,
            "message": f"Bạn đã làm đúng {correct_count}/{total_questions} câu. Điểm: {score:.2f}%"
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in submit_quiz: {error_details}")
        return Response(
            {"error": str(e), "details": error_details},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Fix hàm get_quiz_result
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_result(request, attempt_id):
    """
    Lấy chi tiết kết quả một lần làm quiz
    GET /quiz-attempts/{attempt_id}/
    """
    try:
        user = request.user
        
        # Lấy quiz attempt
        quiz_attempt = get_object_or_404(QuizAttempt, id=attempt_id, user=user)
        quiz = quiz_attempt.quiz
        lesson = quiz.lesson
        
        # Lấy tất cả câu hỏi của quiz
        questions = Question.objects.filter(quiz=quiz).order_by('order_index')
        
        # Tạo dict từ câu trả lời của user
        user_answers_dict = {}
        for ans in quiz_attempt.quiz_answers:
            if 'question_id' in ans and 'answer' in ans:
                user_answers_dict[ans['question_id']] = ans['answer']
        
        # Chuẩn bị dữ liệu câu hỏi kèm đáp án và kết quả
        questions_data = []
        for question in questions:
            user_answer = user_answers_dict.get(question.id)
            is_correct = False
            
            question_data = {
                "question_id": question.id,
                "type": question.question_type,
                "content": question.question_text,
                "order_index": question.order_index,
                "user_answer": user_answer,
            }
            
            # Xử lý theo từng loại câu hỏi - CHỈNH SỬA Ở ĐÂY
            if question.question_type == 'multiple_choice':
                options = question.answer.get("options", [])
                correct_option_idx = question.answer.get("correct_option", 0)
                
                # Format options cho frontend hiển thị đúng
                formatted_options = []
                for idx, opt in enumerate(options):
                    option_letter = chr(65 + idx)  # A, B, C, D
                    formatted_options.append({
                        "id": option_letter,
                        "text": opt
                    })
                
                correct_answer = chr(65 + correct_option_idx) if options else ""
                
                question_data["options"] = formatted_options
                question_data["correct_answer"] = correct_answer
                
                # Kiểm tra đúng/sai
                if user_answer == correct_answer:
                    is_correct = True
                    
            elif question.question_type == 'drag_drop':
                # Hỗ trợ cả 2 format: "pairs" (mới) và "correct_pairs" (cũ)
                pairs = question.answer.get("pairs", [])
                if not pairs:
                    # Fallback cho dữ liệu cũ
                    correct_pairs = question.answer.get("correct_pairs", [])
                    pairs = [
                        {"left": pair.get("side_a", ""), "right": pair.get("side_b", "")}
                        for pair in correct_pairs
                    ]
                
                # Format cho frontend
                correct_dict = {pair.get("left", ""): pair.get("right", "") for pair in pairs}
                
                # Format đúng cho frontend hiển thị (dùng "left"/"right" thay vì "side_a"/"side_b")
                formatted_pairs = [
                    {"left": pair.get("left", ""), "right": pair.get("right", "")}
                    for pair in pairs
                ]
                
                question_data["correct_pairs"] = formatted_pairs
                question_data["correct_answer"] = correct_dict
                
                # Kiểm tra đúng/sai
                if isinstance(user_answer, dict) and user_answer == correct_dict:
                    is_correct = True
                    
            elif question.question_type == 'fill_in':
                # Hỗ trợ cả "accepted_answers" (mới) và "text" (cũ)
                accepted_answers = question.answer.get("accepted_answers", [])
                if not accepted_answers:
                    # Fallback cho dữ liệu cũ
                    text_answer = question.answer.get("text", "")
                    if text_answer:
                        accepted_answers = [text_answer]
                
                question_data["correct_answers"] = accepted_answers
                
                # Kiểm tra đúng/sai
                if isinstance(user_answer, str) and user_answer.strip():
                    user_answer_normalized = user_answer.strip().lower()
                    accepted_normalized = [str(ans).strip().lower() for ans in accepted_answers]
                    if user_answer_normalized in accepted_normalized:
                        is_correct = True
            
            question_data["is_correct"] = is_correct
            questions_data.append(question_data)
        
        # Tính số câu đúng
        correct_count = sum(1 for q in questions_data if q["is_correct"])
        total_questions = len(questions_data)
        
        response_data = {
            "attempt_id": quiz_attempt.id,
            "lesson_id": lesson.id,
            "lesson_title": lesson.title,
            "quiz_id": quiz.id,
            "submitted_at": quiz_attempt.submitted_at,
            "score": float(quiz_attempt.score),
            "status": quiz_attempt.status,
            "passed_score": quiz.passed_score,
            "correct_count": correct_count,
            "total_questions": total_questions,
            "attempt_no": quiz_attempt.attempt_no,
            "questions": questions_data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in get_quiz_result: {error_details}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_quiz_history(request):
    """
    Lấy danh sách lịch sử làm quiz của user
    GET /users/quiz-history/
    """
    try:
        user = request.user

        # Lấy tất cả các lần làm quiz của user, sắp xếp theo thời gian mới nhất
        quiz_attempts = QuizAttempt.objects.filter(
            user=user
        ).select_related(
            'quiz__lesson__course'
        ).order_by('-submitted_at')

        # Chuẩn bị dữ liệu trả về
        history_data = []
        for attempt in quiz_attempts:
            lesson = attempt.quiz.lesson
            course = lesson.course if hasattr(lesson, 'course') else None

            history_data.append({
                "attempt_id": attempt.id,
                "lesson_id": lesson.id,
                "lesson_title": lesson.title,
                "course_name": course.title if course else None,
                "score": float(attempt.score),
                "status": attempt.status,
                "submitted_at": attempt.submitted_at,
                "attempt_no": attempt.attempt_no,
            })

        return Response({
            "total_attempts": len(history_data),
            "history": history_data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in get_user_quiz_history: {error_details}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
