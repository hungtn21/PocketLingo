from django.urls import path
from api.views.user_lesson_views import get_lesson_detail
from api.views.quiz_views import get_lesson_quiz, submit_quiz

urlpatterns = [
    path('lessons/<int:lesson_id>/', get_lesson_detail, name='get_lesson_detail'),
    path('lessons/<int:lesson_id>/quiz/', get_lesson_quiz, name='get_lesson_quiz'),
    path('lessons/<int:lesson_id>/quiz/submit/', submit_quiz, name='submit_quiz'),
]
