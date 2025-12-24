from django.urls import path
from ..views.statistic_views import OverviewStatsView, LearningCountsView, CourseListView, CourseExportCSVView, CourseExportExcelView, total_learning_sessions, learning_sessions_over_time
from ..views.admin_lesson_views import update_admin_lesson
from ..views.quiz_attempt_views import create_quiz, update_quiz, delete_quiz
from ..views.question_views import create_question, update_question, delete_question
from ..views.admin_views import LearnerListView, LearnerDetailView, LearnerStatusView, AdminListView, AdminStatusView
from ..views.admin_course_views import AdminCourseListView, AdminCourseDetailView, AdminLessonListView, AdminLessonDetailView
from ..views.admin_course_views import CourseParticipantsExportCSVView, CourseParticipantsExportExcelView
from ..views.upload_views import UploadImageView
from ..views.admin_enrollment_views import EnrollmentRequestListView, EnrollmentActionView
from api.views.notification_views import delete_admin_notification
from api.views.notification_views import get_admin_notifications_db, mark_notification_read, create_admin_notification, mark_all_admin_notifications_read

urlpatterns = [
    path('stats/overview/', OverviewStatsView.as_view(), name='admin_stats_overview'),
    path('stats/learning-counts/', LearningCountsView.as_view(), name='admin_stats_learning_counts'),
    path('stats/courses/', CourseListView.as_view(), name='admin_stats_courses'),
    path('stats/courses/export/', CourseExportCSVView.as_view(), name='admin_stats_courses_export'),
    path('stats/courses/export-excel/', CourseExportExcelView.as_view(), name='admin_stats_courses_export_excel'),
    path('stats/total-learning-sessions/', total_learning_sessions, name='admin_stats_total_learning_sessions'),
    path('stats/learning-sessions-over-time/', learning_sessions_over_time, name='admin_stats_learning_sessions_over_time'),
    # Admin notifications (DB-backed)
    path('notifications/db/', get_admin_notifications_db, name='admin_notifications_db'),
    path('notifications/mark-read/', mark_notification_read, name='admin_notifications_mark_read'),
    path('notifications/mark-all-read/', mark_all_admin_notifications_read, name='admin_notifications_mark_all_read'),
    path('notifications/create/', create_admin_notification, name='admin_notifications_create'),
    path('lessons/<int:lesson_id>/update/', update_admin_lesson, name='admin_update_lesson'),
    
    # Quiz management
    path('lessons/<int:lesson_id>/quizzes/create/', create_quiz, name='admin_create_quiz'),
    path('quizzes/<int:quiz_id>/update/', update_quiz, name='admin_update_quiz'),
    path('quizzes/<int:quiz_id>/delete/', delete_quiz, name='admin_delete_quiz'),
    
    # Question management
    path('quizzes/<int:quiz_id>/questions/create/', create_question, name='admin_create_question'),
    path('questions/<int:question_id>/update/', update_question, name='admin_update_question'),
    path('questions/<int:question_id>/delete/', delete_question, name='admin_delete_question'),

    path('learners/', LearnerListView.as_view(), name='admin_learners'),
    path('learners/<int:learner_id>/', LearnerDetailView.as_view(), name='admin_learner_detail'),
    path('learners/<int:learner_id>/status/', LearnerStatusView.as_view(), name='admin_learner_status'),

    path('admins/', AdminListView.as_view(), name='admin_list'),                         # GET list, POST create
    path('admins/<int:admin_id>/status/', AdminStatusView.as_view(), name='admin_status'), # POST lock/unlock

    # Course Management
    path('courses/', AdminCourseListView.as_view(), name='admin_course_list'),
    path('courses/<int:course_id>/', AdminCourseDetailView.as_view(), name='admin_course_detail'),
    path('courses/<int:course_id>/export/participants/csv/', CourseParticipantsExportCSVView.as_view(), name='admin_course_participants_export_csv'),
    path('courses/<int:course_id>/export/participants/excel/', CourseParticipantsExportExcelView.as_view(), name='admin_course_participants_export_excel'),
    path('courses/<int:course_id>/lessons/', AdminLessonListView.as_view(), name='admin_lesson_create'),
    path('lessons/<int:lesson_id>/', AdminLessonDetailView.as_view(), name='admin_lesson_detail'),
    
    # Upload
    path('upload/', UploadImageView.as_view(), name='admin_upload_image'),

    # Enrollment Requests
    path('enrollments/requests/', EnrollmentRequestListView.as_view(), name='admin_enrollment_requests'),
    path('enrollments/<int:pk>/action/', EnrollmentActionView.as_view(), name='admin_enrollment_action'),

    # Delete notification
    path('notifications/<int:notif_id>/delete/', delete_admin_notification, name='admin_notification_delete'),
]
