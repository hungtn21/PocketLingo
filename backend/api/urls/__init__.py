from django.urls import path, include
from api.views.user_views import get_leaderboard

# Aggregate all URL modules for the api app here so project-level include('api.urls') works.
# This lets us keep each domain's endpoints in its own file while exposing a unified /api/ tree.
urlpatterns = [
    path('users/', include('api.urls.user_urls')),
    path('', include('api.urls.user_course_urls')),
    path('', include('api.urls.user_lesson_urls')),
    path('', include('api.urls.course_urls')),
    path('', include('api.urls.flashcard_urls')),
    path('', include('api.urls.daily_review_urls')),
    path('admins/', include('api.urls.admin_urls')),
    path('leaderboard/', get_leaderboard, name='leaderboard'),
]
