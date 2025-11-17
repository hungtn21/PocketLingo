from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.paginator import Paginator
from django.db.models import Q, Count, Avg
from api.models.course import Course
from api.models.lesson import Lesson
from api.models.user_course import UserCourse


@api_view(['GET'])
@permission_classes([AllowAny])
def get_courses(request):
    """
    Get courses with search, filter and pagination
    Query params:
    - search: search by title or description
    - language: filter by language
    - level: filter by level
    - min_rating: filter by minimum rating
    - max_rating: filter by maximum rating
    - page: page number (default: 1)
    - page_size: number of items per page (default: 6)
    - user_id: user id to check enrollment status (optional, for demo purpose)
    """
    try:
        # Get query parameters
        search = request.GET.get('search', '')
        language = request.GET.get('language', '')
        level = request.GET.get('level', '')
        min_rating = request.GET.get('min_rating', '')
        max_rating = request.GET.get('max_rating', '')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 6))
        user_id = request.GET.get('user_id', None)  # Giả lập user_id

        # Base queryset
        courses = Course.objects.all()

        # Search by title or description
        if search:
            courses = courses.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        # Filter by language
        if language:
            courses = courses.filter(language=language)

        # Filter by level
        if level:
            courses = courses.filter(level=level)

        # Annotate with lesson count and average rating
        courses = courses.annotate(
            lesson_count=Count('lessons', distinct=True),
            avg_rating=Avg('user_courses__rating')
        )

        # Filter by rating
        if min_rating:
            try:
                min_rating_float = float(min_rating)
                courses = courses.filter(avg_rating__gte=min_rating_float)
            except ValueError:
                pass

        if max_rating:
            try:
                max_rating_float = float(max_rating)
                courses = courses.filter(avg_rating__lte=max_rating_float)
            except ValueError:
                pass

        # Order by id ascending
        courses = courses.order_by('id')

        # Pagination
        paginator = Paginator(courses, page_size)
        page_obj = paginator.get_page(page)

        # Get user enrollments if user_id provided
        user_enrollments = {}
        if user_id:
            enrollments = UserCourse.objects.filter(
                user_id=user_id,
                course_id__in=[course.id for course in page_obj]
            ).values('course_id', 'status')
            user_enrollments = {e['course_id']: e['status'] for e in enrollments}

        # Serialize data
        courses_data = []
        for course in page_obj:
            course_data = {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'language': course.get_language_display(),
                'level': course.get_level_display(),
                'image_url': course.image_url,
                'lesson_count': course.lesson_count,
                'rating': round(course.avg_rating, 1) if course.avg_rating else 0.0,
                'created_at': course.created_at,
                'user_status': user_enrollments.get(course.id, None)  # None = chưa đăng ký
            }
            courses_data.append(course_data)

        return Response({
            'success': True,
            'data': {
                'courses': courses_data,
                'pagination': {
                    'current_page': page_obj.number,
                    'total_pages': paginator.num_pages,
                    'total_items': paginator.count,
                    'page_size': page_size,
                    'has_next': page_obj.has_next(),
                    'has_previous': page_obj.has_previous(),
                }
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_filter_options(request):
    """
    Get available filter options (languages and levels)
    """
    try:
        languages = [{'value': choice[0], 'label': choice[1]} for choice in Course.Language.choices]
        levels = [{'value': choice[0], 'label': choice[1]} for choice in Course.Level.choices]

        return Response({
            'success': True,
            'data': {
                'languages': languages,
                'levels': levels,
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
