from django.urls import path
from api.views import quiz_attempt_views, question_views

urlpatterns = [
    # CRUD Quiz
    # POST: Create, GET: List
    path('lessons/<int:lesson_id>/quizzes/', quiz_attempt_views.list_quizzes, name='quiz_list'),
    # GET: Read, PUT/PATCH: Update, DELETE: Delete
    path('quizzes/<int:quiz_id>/', quiz_attempt_views.get_quiz, name='quiz_detail'),
    #----------------------------------------
    # CRUD câu hỏi trong Quiz (4 loại câu hỏi)
    # POST: Create, GET: List
    path('quizzes/<int:quiz_id>/questions/', question_views.list_questions, name='question_list'),
    # POST: Create multiple
    path('quizzes/<int:quiz_id>/questions/bulk/', question_views.bulk_create_questions, name='question_bulk_create'),
    # POST: Reorder
    path('quizzes/<int:quiz_id>/questions/reorder/', question_views.reorder_questions, name='question_reorder'),
    # GET: Read, PUT/PATCH: Update, DELETE: Delete
    path('questions/<int:question_id>/', question_views.get_question, name='question_detail'),
]
