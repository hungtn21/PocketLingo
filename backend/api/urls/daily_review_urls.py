from django.urls import path
from api.views import daily_review_views

urlpatterns = [
    path('review/summary/', daily_review_views.get_daily_review_summary, name='review_summary'),
    path('review/session/', daily_review_views.get_daily_review_session, name='review_session'),
    path('review/submit/', daily_review_views.submit_daily_review_results, name='submit_review'),
    path('review/count/', daily_review_views.get_review_count, name='review_count'),  
]