from django.urls import path
from ..views.statistic_views import OverviewStatsView, LearningCountsView, CourseListView, CourseExportCSVView
from ..views.admin_views import LearnerListView, LearnerStatusView, AdminListView, AdminStatusView

urlpatterns = [
    path('stats/overview/', OverviewStatsView.as_view(), name='admin_stats_overview'),
    path('stats/learning-counts/', LearningCountsView.as_view(), name='admin_stats_learning_counts'),
    path('stats/courses/', CourseListView.as_view(), name='admin_stats_courses'),
    path('stats/courses/export/', CourseExportCSVView.as_view(), name='admin_stats_courses_export'),

    path('learners/', LearnerListView.as_view(), name='admin_learners'),
    path('learners/<int:learner_id>/status/', LearnerStatusView.as_view(), name='admin_learner_status'),

    path('admins/', AdminListView.as_view(), name='admin_list'),                         # GET list, POST create
    path('admins/<int:admin_id>/status/', AdminStatusView.as_view(), name='admin_status'), # POST lock/unlock
]
