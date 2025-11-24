from django.urls import path, include

# Aggregate all URL modules for the api app here so project-level include('api.urls') works.
# This lets us keep each domain's endpoints in its own file while exposing a unified /api/ tree.
urlpatterns = [
    path('users/', include('api.urls.user_urls')),
    path('', include('api.urls.user_course_urls')),
    path('', include('api.urls.user_lesson_urls')),
    path('', include('api.urls.course_urls')),
]
