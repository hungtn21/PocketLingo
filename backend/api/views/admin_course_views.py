from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.paginator import Paginator
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404

from ..authentication import JWTCookieAuthentication
from ..models import User, Course, Lesson
from ..serializers.course_serializers import CourseSerializer, LessonSerializer

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
            serializer.save(created_by=request.user)
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

    def delete(self, request, lesson_id):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        lesson = get_object_or_404(Lesson, id=lesson_id)
        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
