from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.paginator import Paginator
from django.db.models import Q, Count, Avg
from api.models.course import Course
from api.models.lesson import Lesson
from api.models.user_course import UserCourse
from api.models.user_lesson import UserLesson
from api.models.quiz import Quiz
from api.models.quiz_attempt import QuizAttempt
from api.models.user import User
from api.ai.course_review import generate_course_suggestion_from_database

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
        print(f"User ID from query params: {user_id}, type: {type(user_id)}")
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
                course_id__in=list(page_obj.object_list.values_list('id', flat=True))
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_detail(request, course_id):
    """
    Get course details with lessons, progress, and reviews
    User must be enrolled in the course to view details
    Query params:
    - page: page number for reviews (default: 1)
    - page_size: number of reviews per page (default: 10)
    """
    try:
        user = request.user

        # Defensive: ensure we have a User instance (not a raw email string)
        if isinstance(user, str):
            print(f"DEBUG: request.user is a raw string email: {user}. Attempting to resolve to User instance.")
            user_obj = User.objects.filter(email=user).first()
            if not user_obj:
                return Response({
                    'success': False,
                    'message': 'Không tìm thấy người dùng tương ứng với email trong token.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            user = user_obj

        # Check if user is authenticated (custom user always True, but keep logic for safety)
        if not getattr(user, 'is_authenticated', False):
            return Response({
                'success': False,
                'message': 'Bạn chưa đăng nhập. Vui lòng đăng nhập để xem chi tiết khóa học.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        print(f"DEBUG: User {getattr(user, 'email', 'N/A')} (ID: {getattr(user, 'id', 'N/A')}) đang truy cập course {course_id}")
        print(f"DEBUG: User type: {type(user)}, User object str(): {str(user)}")
        
        # Check if user is enrolled in the course
        user_course = UserCourse.objects.filter(
            user_id=getattr(user, 'id', None),
            course_id=course_id,
            status__in=[UserCourse.Status.APPROVED, UserCourse.Status.COMPLETED]
        ).first()
        
        if not user_course:
            # Check if user has any enrollment for debugging
            any_enrollment = UserCourse.objects.filter(
                user_id=getattr(user, 'id', None),
                course_id=course_id
            ).first()
            
            print(f"DEBUG: Any enrollment found: {any_enrollment}")
            if any_enrollment:
                print(f"DEBUG: Enrollment status: {any_enrollment.status}")
                return Response({
                    'success': False,
                    'message': f'Khóa học của bạn đang ở trạng thái: {any_enrollment.get_status_display()}. Chỉ có thể xem chi tiết khi đã được phê duyệt hoặc đã hoàn thành.'
                }, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({
                    'success': False,
                    'message': 'Bạn chưa đăng ký khóa học này.'
                }, status=status.HTTP_403_FORBIDDEN)
        
        # Get course
        course = Course.objects.filter(id=course_id).annotate(
            avg_rating=Avg('user_courses__rating')
        ).first()
        
        if not course:
            return Response({
                'success': False,
                'message': 'Khóa học không tồn tại'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all lessons in the course
        lessons = Lesson.objects.filter(course_id=course_id).order_by('order_index')
        total_lessons = lessons.count()
        
        # Get user's lesson completion status
        user_lessons = UserLesson.objects.filter(
            user_id=getattr(user, 'id', None),
            lesson__course_id=course_id
        ).select_related('lesson')
        
        completed_lessons_map = {ul.lesson_id: ul.completed for ul in user_lessons}
        completed_count = sum(1 for completed in completed_lessons_map.values() if completed)
        
        # Calculate progress
        progress_percent = (completed_count / total_lessons * 100) if total_lessons > 0 else 0
        
        # Update progress in user_course
        try:
            user_course.progress_percent = round(progress_percent, 2)
            user_course.save()
            print(f"DEBUG: Progress updated successfully: {progress_percent}%")
        except Exception as save_error:
            print(f"DEBUG: Error saving progress: {str(save_error)}")
            # Continue without failing - progress update is not critical
        
        # Prepare lessons data
        lessons_data = []
        for lesson in lessons:
            lessons_data.append({
                'id': lesson.id,
                'title': lesson.title,
                'description': lesson.description,
                'order_index': lesson.order_index,
                'completed': completed_lessons_map.get(lesson.id, False)
            })
        
        # Get reviews with pagination (from UserCourse with rating and comment)
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        
        # Get all user_courses with reviews (rating not null)
        reviews = UserCourse.objects.filter(
            course_id=course_id,
            rating__isnull=False
        ).select_related('user').order_by('-requested_at')
        
        # Check if current user has already reviewed
        user_has_reviewed = user_course.rating is not None
        
        # Paginate reviews
        paginator = Paginator(reviews, page_size)
        page_obj = paginator.get_page(page)
        
        reviews_data = []
        for user_course_review in page_obj:
            reviews_data.append({
                'id': user_course_review.id,
                'user_name': user_course_review.user.username or user_course_review.user.email,
                'rating': user_course_review.rating,
                'comment': user_course_review.comment,
                'created_at': user_course_review.requested_at,
                'is_own_review': user_course_review.user_id == user.id
            })
        
        # Course data
        course_data = {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'language': course.get_language_display(),
            'level': course.get_level_display(),
            'image_url': course.image_url,
            'total_lessons': total_lessons,
            'completed_lessons': completed_count,
            'progress_percent': round(progress_percent, 2),
            'avg_rating': round(course.avg_rating, 1) if course.avg_rating else 0.0,
            'lessons': lessons_data,
            'user_has_reviewed': user_has_reviewed,
            'can_review': progress_percent >= 80  # Can review if completed 80% or more
        }
        
        return Response({
            'success': True,
            'data': {
                'course': course_data,
                'reviews': {
                    'items': reviews_data,
                    'pagination': {
                        'current_page': page_obj.number,
                        'total_pages': paginator.num_pages,
                        'total_items': paginator.count,
                        'page_size': page_size,
                        'has_next': page_obj.has_next(),
                        'has_previous': page_obj.has_previous(),
                    }
                }
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course_review(request, course_id):
    """
    Create or update a course review
    User must have completed at least 80% of the course
    Request body:
    - rating: integer from 1 to 5 (required)
    - comment: text (optional)
    """
    try:
        user = request.user
        
        # Check if user is enrolled in the course
        user_course = UserCourse.objects.filter(
            user=user,
            course_id=course_id,
            status__in=[UserCourse.Status.APPROVED, UserCourse.Status.COMPLETED]
        ).first()
        
        #Check if user_course exists
        if not user_course:
            return Response({
                'success': False,
                'message': 'Bạn chưa đăng ký khóa học này.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user has completed at least 80% of the course
        if user_course.progress_percent < 80:
            return Response({
                'success': False,
                'message': 'Bạn cần hoàn thành ít nhất 80% khóa học để đánh giá'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get rating and comment from request
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')
        
        # Validate rating
        if rating is None or not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
            return Response({
                'success': False,
                'message': 'Rating phải là số từ 1 đến 5'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user has already reviewed
        already_reviewed = user_course.rating is not None
        
        # Update rating and comment in user_course
        user_course.rating = rating
        user_course.comment = comment
        user_course.save()
        
        # Calculate new average rating
        course = Course.objects.filter(id=course_id).annotate(
            avg_rating=Avg('user_courses__rating')
        ).first()
        
        return Response({
            'success': True,
            'message': 'Đã cập nhật đánh giá' if already_reviewed else 'Đã gửi đánh giá thành công',
            'data': {
                'review': {
                    'id': user_course.id,
                    'rating': user_course.rating,
                    'comment': user_course.comment,
                    'created_at': user_course.requested_at
                },
                'course_avg_rating': round(course.avg_rating, 1) if course.avg_rating else 0.0
            }
        }, status=status.HTTP_201_CREATED if not already_reviewed else status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course_review(request, course_id):
    """
    Delete user's review for a course (set rating and comment to null)
    """
    try:
        user = request.user
        
        # Find the user_course
        user_course = UserCourse.objects.filter(
            user=user,
            course_id=course_id
        ).first()
        
        if not user_course or user_course.rating is None:
            return Response({
                'success': False,
                'message': 'Không tìm thấy đánh giá của bạn'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Remove rating and comment
        user_course.rating = None
        user_course.comment = None
        user_course.save()
        
        return Response({
            'success': True,
            'message': 'Đã xóa đánh giá thành công'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_ai_course_suggestions(request):
    """
    Get AI-powered course suggestions based on user prompt
    Request body:
    - prompt: user's learning requirements (required)
    
    Returns:
    - explanation: AI's explanation in Vietnamese
    - courses: list of recommended courses with full details
    """
    try:
        # Get prompt from request
        prompt = request.data.get('prompt', '').strip()
        
        if not prompt:
            return Response({
                'success': False,
                'error': 'Vui lòng nhập yêu cầu của bạn'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get all courses from database
        courses = Course.objects.all().annotate(
            lesson_count=Count('lessons', distinct=True),
            avg_rating=Avg('user_courses__rating')
        )
        
        # Prepare course data for AI
        course_data = []
        for course in courses:
            course_data.append({
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'language': course.get_language_display(),
                'level': course.get_level_display(),
            })
        
        # Call AI service (temporarily disabled)
        ai_result = generate_course_suggestion_from_database(prompt, course_data)
        
        # Get recommended course IDs (temporarily return empty for now)
        course_ids = ai_result.get('course_ids', [])
        explanation = ai_result.get('explanation', '')
        
        # Get user's enrolled course IDs
        user = request.user
        enrolled_course_ids = set()
        if user and hasattr(user, 'id'):
            # Get all courses that user has enrolled in (any status)
            enrolled_course_ids = set(
                UserCourse.objects.filter(user_id=user.id)
                .values_list('course_id', flat=True)
            )
        
        # Filter out enrolled courses from recommended course IDs
        unenrolled_course_ids = [cid for cid in course_ids if cid not in enrolled_course_ids]
        
        # Fetch full course details only for unenrolled courses
        recommended_courses = Course.objects.filter(id__in=unenrolled_course_ids).annotate(
            lesson_count=Count('lessons', distinct=True),
            avg_rating=Avg('user_courses__rating')
        )
        
        # Prepare response data (only unenrolled courses)
        courses_response = []
        for course in recommended_courses:
            courses_response.append({
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'language': course.get_language_display(),
                'level': course.get_level_display(),
                'thumbnail': course.image_url,
                'rating': round(course.avg_rating, 1) if course.avg_rating else 0.0,
                'total_lessons': course.lesson_count,
                'duration': f"{course.lesson_count} bài học",
                'user_status': None,  # Always None since we only show unenrolled courses
            })
        
        return Response({
            'success': True,
            'explanation': explanation,
            'courses': courses_response
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in get_ai_course_suggestions: {str(e)}")
        return Response({
            'success': False,
            'error': 'Đã có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
