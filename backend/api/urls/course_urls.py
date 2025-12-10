from django.urls import path
from api.views import course_views, lesson_views

urlpatterns = [
    # Course endpoints
    path('courses/', course_views.get_courses, name='get_courses'),
    path('courses/filters/', course_views.get_filter_options, name='get_filter_options'),
    path('courses/<int:course_id>/', course_views.get_course_detail, name='get_course_detail'),
    
    # AI course suggestions
    path('courses/ai-suggestions/', course_views.get_ai_course_suggestions, name='get_ai_course_suggestions'),
    
    # Course review endpoints
    path('courses/<int:course_id>/reviews/', course_views.create_course_review, name='create_course_review'),
    path('courses/<int:course_id>/reviews/delete/', course_views.delete_course_review, name='delete_course_review'),
    
    # Lesson endpoints
    path('lessons/<int:lesson_id>/complete/', lesson_views.complete_lesson, name='complete_lesson'),
]
