from django.db.models import Count, Avg, Q
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from ..authentication import JWTCookieAuthentication
from ..models import User, Course, Lesson, QuizAttempt, UserCourse, UserLesson
from django.utils import timezone
from datetime import datetime, timedelta
import csv
from io import StringIO


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

        resp = Response(output.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = 'attachment; filename="courses_stats.csv"'
        return resp
