from django.db.models import Count, Avg, Q
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.utils.decorators import method_decorator
from ..authentication import JWTCookieAuthentication
from ..models import User, Course, Lesson, QuizAttempt, UserCourse, UserLesson
from django.utils import timezone
from datetime import datetime, timedelta
import csv
from io import StringIO
from io import BytesIO
import pandas as pd
from django.http import HttpResponse


def _require_admin(user):
    return getattr(user, 'role', None) in (User.Role.ADMIN, User.Role.SUPERADMIN)


@method_decorator(csrf_exempt, name='dispatch')
class OverviewStatsView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        print(f"Getting stats for admin user: {request.user.email}")
        
        total_learners = User.objects.filter(role=User.Role.LEARNER).count()
        print(f"Total learners: {total_learners}")
        
        total_courses = Course.objects.count()
        print(f"Total courses: {total_courses}")
        
        total_lessons = Lesson.objects.count()
        print(f"Total lessons: {total_lessons}")

        avg_quiz_score = QuizAttempt.objects.aggregate(avg=Avg('score'))['avg'] or 0
        print(f"Average quiz score: {avg_quiz_score}")

        completed_enrollments = UserCourse.objects.filter(status=UserCourse.Status.COMPLETED).count()
        total_enrollments = UserCourse.objects.count()
        course_completion_rate = 0
        if total_enrollments > 0:
            course_completion_rate = round((completed_enrollments / total_enrollments) * 100, 2)
        
        print(f"Completed enrollments: {completed_enrollments}, Total: {total_enrollments}, Rate: {course_completion_rate}%")

        response_data = {
            'total_learners': total_learners,
            'total_courses': total_courses,
            'total_lessons': total_lessons,
            'avg_quiz_score': float(avg_quiz_score),
            'course_completion_rate': course_completion_rate,
            'completed_enrollments': completed_enrollments,
            'total_enrollments': total_enrollments,
        }
        
        print(f"Returning data: {response_data}")
        return Response(response_data)


class LearningCountsView(APIView):
    """Return counts of learning events (lesson completions) per period."""
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        end_str = request.GET.get('end')
        start_str = request.GET.get('start')
        granularity = request.GET.get('granularity', 'day')

        try:
            if end_str:
                end = datetime.fromisoformat(end_str)
            else:
                end = timezone.now()
        except Exception:
            end = timezone.now()

        try:
            if start_str:
                start = datetime.fromisoformat(start_str)
            else:
                start = end - timedelta(days=30)
        except Exception:
            start = end - timedelta(days=30)

        # Choose truncation function
        if granularity == 'week':
            trunc = TruncWeek
        elif granularity == 'month':
            trunc = TruncMonth
        else:
            trunc = TruncDay

        qs = UserLesson.objects.filter(completed=True, completed_at__range=(start, end))
        grouped = qs.annotate(period=trunc('completed_at')).values('period').annotate(count=Count('id')).order_by('period')

        data = []
        for row in grouped:
            period = row['period']
            data.append({'period': period.isoformat(), 'count': row['count']})

        return Response({'start': start.isoformat(), 'end': end.isoformat(), 'granularity': granularity, 'data': data})


class CourseListView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        search = request.GET.get('search')
        start_str = request.GET.get('start')
        end_str = request.GET.get('end')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))

        try:
            if end_str:
                end = datetime.fromisoformat(end_str)
            else:
                end = timezone.now()
        except Exception:
            end = timezone.now()
        try:
            if start_str:
                start = datetime.fromisoformat(start_str)
            else:
                start = end - timedelta(days=30)
        except Exception:
            start = end - timedelta(days=30)

        qs = Course.objects.all()
        if search:
            qs = qs.filter(title__icontains=search)

        total = qs.count()

        # Annotate attempts and avg_score within date range
        qs = qs.annotate(
            lessons_count=Count('lessons', distinct=True),
            attempts_count=Count('lessons__quizzes__attempts', filter=Q(lessons__quizzes__attempts__submitted_at__range=(start, end)), distinct=True),
            avg_score=Avg('lessons__quizzes__attempts__score', filter=Q(lessons__quizzes__attempts__submitted_at__range=(start, end)))
        )

        # Completion rate per course (completed user_courses / total enrollments for that course within date range)
        results = []
        offset = (page - 1) * page_size
        for course in qs.order_by('-created_at')[offset:offset + page_size]:
            total_enrolls = UserCourse.objects.filter(course=course).count()
            completed_enrolls = UserCourse.objects.filter(course=course, status=UserCourse.Status.COMPLETED).count()
            completion_rate = 0
            if total_enrolls > 0:
                completion_rate = round((completed_enrolls / total_enrolls) * 100, 2)

            results.append({
                'id': course.id,
                'title': course.title,
                'lessons_count': getattr(course, 'lessons_count', 0),
                'attempts_count': getattr(course, 'attempts_count', 0) or 0,
                'avg_score': float(getattr(course, 'avg_score', 0) or 0),
                'completion_rate': completion_rate,
            })

        return Response({'total': total, 'page': page, 'page_size': page_size, 'start': start.isoformat(), 'end': end.isoformat(), 'results': results})


class CourseExportCSVView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        search = request.GET.get('search')
        start_str = request.GET.get('start')
        end_str = request.GET.get('end')

        try:
            if end_str:
                end = datetime.fromisoformat(end_str)
            else:
                end = timezone.now()
        except Exception:
            end = timezone.now()
        try:
            if start_str:
                start = datetime.fromisoformat(start_str)
            else:
                start = end - timedelta(days=30)
        except Exception:
            start = end - timedelta(days=30)

        qs = Course.objects.all()
        if search:
            qs = qs.filter(title__icontains=search)

        qs = qs.annotate(
            lessons_count=Count('lessons', distinct=True),
            attempts_count=Count('lessons__quizzes__attempts', filter=Q(lessons__quizzes__attempts__submitted_at__range=(start, end)), distinct=True),
            avg_score=Avg('lessons__quizzes__attempts__score', filter=Q(lessons__quizzes__attempts__submitted_at__range=(start, end)))
        )

        # Build CSV
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Tên khóa học', 'Lượt học', 'Điểm TB', 'Tỉ lệ hoàn thành (%)'])
        for course in qs.order_by('title'):
            total_enrolls = UserCourse.objects.filter(course=course).count()
            completed_enrolls = UserCourse.objects.filter(course=course, status=UserCourse.Status.COMPLETED).count()
            completion_rate = 0
            if total_enrolls > 0:
                completion_rate = round((completed_enrolls / total_enrolls) * 100, 2)

            writer.writerow([
                course.title,
                getattr(course, 'attempts_count', 0) or 0,
                float(getattr(course, 'avg_score', 0) or 0),
                completion_rate,
            ])

        # Return bytes with UTF-8 BOM so Excel opens Vietnamese correctly
        csv_bytes = output.getvalue().encode('utf-8-sig')
        resp = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8')
        resp['Content-Disposition'] = 'attachment; filename="courses_stats.csv"'
        return resp


class CourseExportExcelView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        search = request.GET.get('search')
        start_str = request.GET.get('start')
        end_str = request.GET.get('end')

        try:
            if end_str:
                end = datetime.fromisoformat(end_str)
            else:
                end = timezone.now()
        except Exception:
            end = timezone.now()
        try:
            if start_str:
                start = datetime.fromisoformat(start_str)
            else:
                start = end - timedelta(days=30)
        except Exception:
            start = end - timedelta(days=30)

        qs = Course.objects.all()
        if search:
            qs = qs.filter(title__icontains=search)

        qs = qs.annotate(
            lessons_count=Count('lessons', distinct=True),
            attempts_count=Count('lessons__quizzes__attempts', filter=Q(lessons__quizzes__attempts__submitted_at__range=(start, end)), distinct=True),
            avg_score=Avg('lessons__quizzes__attempts__score', filter=Q(lessons__quizzes__attempts__submitted_at__range=(start, end)))
        )

        rows = []
        for course in qs.order_by('title'):
            total_enrolls = UserCourse.objects.filter(course=course).count()
            completed_enrolls = UserCourse.objects.filter(course=course, status=UserCourse.Status.COMPLETED).count()
            completion_rate = 0
            if total_enrolls > 0:
                completion_rate = round((completed_enrolls / total_enrolls) * 100, 2)

            rows.append({
                'Tên khóa học': course.title,
                'Lượt học': getattr(course, 'attempts_count', 0) or 0,
                'Điểm TB': float(getattr(course, 'avg_score', 0) or 0),
                'Tỉ lệ hoàn thành (%)': completion_rate,
            })

        df = pd.DataFrame.from_records(rows)
        output = BytesIO()
        # Use pandas to write Excel file (requires openpyxl in requirements)
        df.to_excel(output, index=False, sheet_name='Courses')
        output.seek(0)

        excel_bytes = output.getvalue()
        resp = HttpResponse(excel_bytes, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        resp['Content-Disposition'] = 'attachment; filename="courses_stats.xlsx"'
        return resp

# --- API: Tổng số lượt học (quiz + flashcard) ---
@api_view(['GET'])
@authentication_classes([JWTCookieAuthentication])
@permission_classes([IsAuthenticated])
def total_learning_sessions(request):
    """
    API trả về tổng số lượt học (làm quiz + học hết flashcard).
    """
    total_quiz_attempts = QuizAttempt.objects.count()
    total_flashcard_sessions = UserLesson.objects.filter(flashcard_completed=True).count()
    total_sessions = total_quiz_attempts + total_flashcard_sessions
    return Response({
        'total_sessions': total_sessions,
        'quiz_attempts': total_quiz_attempts,
        'flashcard_sessions': total_flashcard_sessions,
    })


# --- API: Lượt học theo thời gian (tùy chọn loại) ---
@api_view(['GET'])
@authentication_classes([JWTCookieAuthentication])
@permission_classes([IsAuthenticated])
def learning_sessions_over_time(request):
    """
    API trả về lượt học theo thời gian (theo ngày/tuần/tháng), cho phép chọn loại: quiz, flashcard, tổng.
    Query params:
        - start: ngày bắt đầu (ISO)
        - end: ngày kết thúc (ISO)
        - granularity: day/week/month
        - type: quiz|flashcard|all (mặc định: all)
    """
    from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
    type_ = request.GET.get('type', 'all')
    granularity = request.GET.get('granularity', 'day')
    end_str = request.GET.get('end')
    start_str = request.GET.get('start')
    try:
        if end_str:
            end = datetime.fromisoformat(end_str)
        else:
            end = timezone.now()
    except Exception:
        end = timezone.now()
    try:
        if start_str:
            start = datetime.fromisoformat(start_str)
        else:
            start = end - timedelta(days=30)
    except Exception:
        start = end - timedelta(days=30)

    if granularity == 'week':
        trunc = TruncWeek
    elif granularity == 'month':
        trunc = TruncMonth
    else:
        trunc = TruncDay

    data = []
    if type_ == 'quiz':
        qs = QuizAttempt.objects.filter(submitted_at__range=(start, end))
        grouped = qs.annotate(period=trunc('submitted_at')).values('period').annotate(count=Count('id')).order_by('period')
        for row in grouped:
            data.append({'period': row['period'].isoformat(), 'count': row['count']})
    elif type_ == 'flashcard':
        qs = UserLesson.objects.filter(flashcard_completed=True, flashcard_completed_at__range=(start, end))
        grouped = qs.annotate(period=trunc('flashcard_completed_at')).values('period').annotate(count=Count('id')).order_by('period')
        for row in grouped:
            data.append({'period': row['period'].isoformat(), 'count': row['count']})
    else:  # all
        # Lấy từng loại, merge lại theo period
        quiz_qs = QuizAttempt.objects.filter(submitted_at__range=(start, end)).annotate(period=trunc('submitted_at')).values('period').annotate(count=Count('id')).order_by('period')
        flashcard_qs = UserLesson.objects.filter(flashcard_completed=True, flashcard_completed_at__range=(start, end)).annotate(period=trunc('flashcard_completed_at')).values('period').annotate(count=Count('id')).order_by('period')
        period_map = {}
        for row in quiz_qs:
            key = row['period'].isoformat()
            period_map[key] = period_map.get(key, 0) + row['count']
        for row in flashcard_qs:
            key = row['period'].isoformat()
            period_map[key] = period_map.get(key, 0) + row['count']
        for period in sorted(period_map.keys()):
            data.append({'period': period, 'count': period_map[period]})

    return Response({
        'start': start.isoformat(),
        'end': end.isoformat(),
        'granularity': granularity,
        'type': type_,
        'data': data,
    })