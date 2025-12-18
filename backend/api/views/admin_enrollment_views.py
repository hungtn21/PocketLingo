from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from rest_framework import serializers

from ..authentication import JWTCookieAuthentication
from ..models import User, UserCourse

def _require_admin(user):
    return user.role in [User.Role.ADMIN, User.Role.SUPERADMIN]

class EnrollmentRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = UserCourse
        fields = ['id', 'user_name', 'user_email', 'course_title', 'requested_at', 'status']

class EnrollmentRequestListView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        search = request.query_params.get('search', '').strip()
        
        queryset = UserCourse.objects.filter(status=UserCourse.Status.PENDING).select_related('user', 'course')
        
        if search:
            queryset = queryset.filter(
                Q(user__name__icontains=search) | 
                Q(course__title__icontains=search) |
                Q(user__email__icontains=search)
            )
            
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_items = queryset.count()
        total_pages = (total_items + page_size - 1) // page_size
        
        data = queryset.order_by('-requested_at')[start:end]
        serializer = EnrollmentRequestSerializer(data, many=True)
        
        return Response({
            'results': serializer.data,
            'total_pages': total_pages,
            'current_page': page,
            'total_items': total_items
        })

class EnrollmentActionView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not _require_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        enrollment = get_object_or_404(UserCourse, id=pk)
        action = request.data.get('action') # 'approve' or 'reject'
        
        if action == 'approve':
            enrollment.status = UserCourse.Status.APPROVED
            enrollment.approved_at = timezone.now()
            enrollment.save()
            return Response({'detail': 'Approved successfully'})
            
        elif action == 'reject':
            reason = request.data.get('reason', '')
            enrollment.status = UserCourse.Status.REJECTED
            enrollment.reason = reason
            enrollment.save()
            return Response({'detail': 'Rejected successfully'})
            
        return Response({'detail': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
