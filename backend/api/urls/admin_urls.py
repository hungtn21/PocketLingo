from django.urls import path
from ..views.statistic_views import OverviewStatsView, LearningCountsView, CourseListView, CourseExportCSVView
from ..views.admin_views import LearnerListView, LearnerStatusView, AdminListView, AdminStatusView
from ..views.admin_course_views import AdminCourseListView, AdminCourseDetailView, AdminLessonListView, AdminLessonDetailView
from ..views.upload_views import UploadImageView
from ..views.admin_enrollment_views import EnrollmentRequestListView, EnrollmentActionView

urlpatterns = [
    path('stats/overview/', OverviewStatsView.as_view(), name='admin_stats_overview'),
    path('stats/learning-counts/', LearningCountsView.as_view(), name='admin_stats_learning_counts'),
    path('stats/courses/', CourseListView.as_view(), name='admin_stats_courses'),
    path('stats/courses/export/', CourseExportCSVView.as_view(), name='admin_stats_courses_export'),

    path('learners/', LearnerListView.as_view(), name='admin_learners'),
    path('learners/<int:learner_id>/status/', LearnerStatusView.as_view(), name='admin_learner_status'),

    path('admins/', AdminListView.as_view(), name='admin_list'),                         # GET list, POST create
    path('admins/<int:admin_id>/status/', AdminStatusView.as_view(), name='admin_status'), # POST lock/unlock

    # Course Management
    path('courses/', AdminCourseListView.as_view(), name='admin_course_list'),
    path('courses/<int:course_id>/', AdminCourseDetailView.as_view(), name='admin_course_detail'),
    path('courses/<int:course_id>/lessons/', AdminLessonListView.as_view(), name='admin_lesson_create'),
    path('lessons/<int:lesson_id>/', AdminLessonDetailView.as_view(), name='admin_lesson_detail'),
    
    # Upload
    path('upload/', UploadImageView.as_view(), name='admin_upload_image'),

    # Enrollment Requests
    path('enrollments/requests/', EnrollmentRequestListView.as_view(), name='admin_enrollment_requests'),
    path('enrollments/<int:pk>/action/', EnrollmentActionView.as_view(), name='admin_enrollment_action'),
]
