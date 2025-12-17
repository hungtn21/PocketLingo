from django.urls import path
from api.views import user_flashcard_views

urlpatterns = [
    path('lessons/<int:lesson_id>/study-info/', user_flashcard_views.get_lesson_study_info, name='lesson_study_info'),
    path('lessons/<int:lesson_id>/learn-new/', user_flashcard_views.get_learn_new_session, name='learn_new_session'),
    path('lessons/<int:lesson_id>/learn-new/submit/', user_flashcard_views.submit_learn_new_results, name='submit_learn_new'),
    path('lessons/<int:lesson_id>/practice/', user_flashcard_views.get_practice_session, name='practice_session'),
    path('flashcards/ai-explain/', user_flashcard_views.ai_explain_flashcard, name='ai_explain'),
]