from django.urls import path
from ..views.statistic_views import OverviewStatsView, LearningCountsView, CourseListView, CourseExportCSVView

urlpatterns = [
    path('stats/overview/', OverviewStatsView.as_view(), name='admin_stats_overview'),
    path('stats/learning-counts/', LearningCountsView.as_view(), name='admin_stats_learning_counts'),
    path('stats/courses/', CourseListView.as_view(), name='admin_stats_courses'),
    path('stats/courses/export/', CourseExportCSVView.as_view(), name='admin_stats_courses_export'),
]
