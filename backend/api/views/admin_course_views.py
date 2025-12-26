from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.paginator import Paginator
from django.db.models import Q, Count, Avg
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)

from ..authentication import JWTCookieAuthentication
from ..models import User, Course, Lesson, Flashcard, Quiz, Question
from ..serializers.course_serializers import CourseSerializer, LessonSerializer
from ..models import UserCourse, QuizAttempt
from django.http import HttpResponse
import csv
from io import StringIO, BytesIO
import pandas as pd

def _require_admin(user):
    return user.role in [User.Role.ADMIN, User.Role.SUPERADMIN]

class AdminCourseListView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        search = request.GET.get('search', '').strip()
        level = request.GET.get('level', '')
        language = request.GET.get('language', '')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))

        qs = Course.objects.annotate(lesson_count=Count('lessons')).order_by('-created_at')

        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if level:
            qs = qs.filter(level=level)
        if language:
            qs = qs.filter(language=language)

        paginator = Paginator(qs, page_size)
        page_obj = paginator.get_page(page)

        data = CourseSerializer(page_obj.object_list, many=True).data
        return Response({
            'results': data,
            'page': page_obj.number,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'total_items': paginator.count,
        })

    def post(self, request):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(created_by=request.user)
            except IntegrityError as e:
                logger.warning("Failed to set created_by=%s due to IntegrityError: %s. Saving without created_by.", getattr(request.user, 'id', None), str(e))
                # Fix tạm: Gán created_by=None do constraint FK trên database
                serializer.save(created_by=None)
                data = dict(serializer.data)
                data['_warning'] = 'created_by was not set due to FK constraint on database (saved as null)'
                return Response(data, status=status.HTTP_201_CREATED)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminCourseDetailView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        
        course = get_object_or_404(Course.objects.annotate(lesson_count=Count('lessons')), id=course_id)
        serializer = CourseSerializer(course)
        
        # Get lessons
        lessons = Lesson.objects.filter(course=course).order_by('order_index')
        lesson_data = LessonSerializer(lessons, many=True).data
        
        return Response({
            'course': serializer.data,
            'lessons': lesson_data
        })

    def put(self, request, course_id):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        course = get_object_or_404(Course, id=course_id)
        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, course_id):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        course = get_object_or_404(Course, id=course_id)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminLessonListView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        course = get_object_or_404(Course, id=course_id)
        data = request.data.copy()
        data['course'] = course.id # This might be tricky with ModelSerializer if course is not in fields or read_only
        
        # Since LessonSerializer doesn't have course field, we need to handle it.
        # Or we can pass it in save()
        
        serializer = LessonSerializer(data=data)
        if serializer.is_valid():
            serializer.save(course=course)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminLessonDetailView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):
        # Provide detail of a lesson (flashcards, quiz, questions) for admin
        if not _require_admin(request.user):
            return Response({'success': False, 'error': 'Bạn không có quyền truy cập.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            lesson = Lesson.objects.select_related('course').get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'success': False, 'error': 'Bài học không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch Flashcards
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

        # Fetch Quiz
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

    def delete(self, request, lesson_id):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        lesson = get_object_or_404(Lesson, id=lesson_id)
        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CourseParticipantsExportCSVView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        course = get_object_or_404(Course, id=course_id)

        qs = UserCourse.objects.filter(course=course).select_related('user')

        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['User ID', 'Email', 'Name', 'Trạng thái', 'Tiến độ (%)', 'Đăng kí lúc', 'Phê duyệt lúc', 'Số lần làm bài quiz', 'Điểm trung bình quiz'])

        for uc in qs.order_by('requested_at'):
            user = uc.user
            attempts = QuizAttempt.objects.filter(user=user, quiz__lesson__course=course)
            attempts_count = attempts.count()
            avg_score = attempts.aggregate(avg=Avg('score'))['avg'] if attempts_count > 0 else 0
            avg_score = float(avg_score or 0)

            writer.writerow([
                user.id,
                user.email,
                user.name,
                uc.status,
                float(uc.progress_percent or 0),
                uc.requested_at.isoformat() if uc.requested_at else '',
                uc.approved_at.isoformat() if uc.approved_at else '',
                attempts_count,
                avg_score,
            ])

        csv_bytes = output.getvalue().encode('utf-8-sig')
        resp = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8')
        resp['Content-Disposition'] = f'attachment; filename="course_{course_id}_participants.csv"'
        return resp


class CourseParticipantsExportExcelView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        course = get_object_or_404(Course, id=course_id)
        qs = UserCourse.objects.filter(course=course).select_related('user')

        rows = []
        for uc in qs.order_by('requested_at'):
            user = uc.user
            attempts = QuizAttempt.objects.filter(user=user, quiz__lesson__course=course)
            attempts_count = attempts.count()
            avg_score = attempts.aggregate(avg=Avg('score'))['avg'] if attempts_count > 0 else 0
            rows.append({
                'User ID': user.id,
                'Email': user.email,
                'Name': user.name,
                'Trạng thái': uc.status,
                'Tiến độ (%)': float(uc.progress_percent or 0),
                'Đăng kí lúc': uc.requested_at.isoformat() if uc.requested_at else '',
                'Phê duyệt lúc': uc.approved_at.isoformat() if uc.approved_at else '',
                'Số lần làm bài quiz': attempts_count,
                'Điểm trung bình quiz': float(avg_score or 0),
            })

        df = pd.DataFrame.from_records(rows)
        output = BytesIO()
        df.to_excel(output, index=False, sheet_name='Participants')
        output.seek(0)

        resp = HttpResponse(output.getvalue(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        resp['Content-Disposition'] = f'attachment; filename="course_{course_id}_participants.xlsx"'
        return resp
