from django.urls import path
from api.views import user_flashcard_views, flashcard_views

urlpatterns = [
    # CRUD Flashcard
    # GET: List
    path('lessons/<int:lesson_id>/flashcards/', flashcard_views.list_flashcards, name='flashcard_list'),
    # POST: Create một flashcard
    path('lessons/<int:lesson_id>/flashcards/create/', flashcard_views.create_flashcard, name='flashcard_create'),
    # POST: Tạo nhiều flashcards cùng lúc
    path('lessons/<int:lesson_id>/flashcards/bulk/', flashcard_views.bulk_create_flashcards, name='flashcard_bulk_create'),
    # GET: Read chi tiết
    path('flashcards/<int:flashcard_id>/', flashcard_views.get_flashcard, name='flashcard_detail'),
    # PUT/PATCH: Update
    path('flashcards/<int:flashcard_id>/update/', flashcard_views.update_flashcard, name='flashcard_update'),
    # DELETE: Delete
    path('flashcards/<int:flashcard_id>/delete/', flashcard_views.delete_flashcard, name='flashcard_delete'),
    #---------------------------------------
    # Học flashcard (user)
    path('lessons/<int:lesson_id>/study-info/', user_flashcard_views.get_lesson_study_info, name='lesson_study_info'),
    path('lessons/<int:lesson_id>/learn-new/', user_flashcard_views.get_learn_new_session, name='learn_new_session'),
    path('lessons/<int:lesson_id>/learn-new/submit/', user_flashcard_views.submit_learn_new_results, name='submit_learn_new'),
    path('lessons/<int:lesson_id>/practice/', user_flashcard_views.get_practice_session, name='practice_session'),
    path('flashcards/ai-explain/', user_flashcard_views.ai_explain_flashcard, name='ai_explain'),
]