from django.urls import path
from ..views.statistic_views import OverviewStatsView, LearningCountsView, CourseListView, CourseExportCSVView
from ..views.admin_lesson_views import get_admin_lesson_detail, update_admin_lesson
from ..views.quiz_attempt_views import create_quiz, update_quiz, delete_quiz
from ..views.question_views import create_question, update_question, delete_question

urlpatterns = [
    path('stats/overview/', OverviewStatsView.as_view(), name='admin_stats_overview'),
    path('stats/learning-counts/', LearningCountsView.as_view(), name='admin_stats_learning_counts'),
    path('stats/courses/', CourseListView.as_view(), name='admin_stats_courses'),
    path('stats/courses/export/', CourseExportCSVView.as_view(), name='admin_stats_courses_export'),
    path('lessons/<int:lesson_id>/', get_admin_lesson_detail, name='admin_get_lesson_detail'),
    path('lessons/<int:lesson_id>/update/', update_admin_lesson, name='admin_update_lesson'),
    
    # Quiz management
    path('lessons/<int:lesson_id>/quizzes/create/', create_quiz, name='admin_create_quiz'),
    path('quizzes/<int:quiz_id>/update/', update_quiz, name='admin_update_quiz'),
    path('quizzes/<int:quiz_id>/delete/', delete_quiz, name='admin_delete_quiz'),
    
    # Question management
    path('quizzes/<int:quiz_id>/questions/create/', create_question, name='admin_create_question'),
    path('questions/<int:question_id>/update/', update_question, name='admin_update_question'),
    path('questions/<int:question_id>/delete/', delete_question, name='admin_delete_question'),
]
