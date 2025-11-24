from django.urls import path
from api.views.user_lesson_views import get_lesson_detail

urlpatterns = [
    path('lessons/<int:lesson_id>/', get_lesson_detail, name='get_lesson_detail'),
]
