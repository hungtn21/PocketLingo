from django.urls import path
from ..views import user_course_views

urlpatterns = [
    path('courses/<int:course_id>/enroll/', user_course_views.enroll_course, name='enroll_course'),
    path('courses/<int:course_id>/enrollment-status/', user_course_views.get_enrollment_status, name='get_enrollment_status'),
    path('enrollments/<int:enrollment_id>/approve/', user_course_views.approve_enrollment, name='approve_enrollment'),
    path('enrollments/<int:enrollment_id>/reject/', user_course_views.reject_enrollment, name='reject_enrollment'),
]
