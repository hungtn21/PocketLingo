from django.urls import path
from ..views.user_views import RegisterUserView, RegisterAdminView, VerifyEmailView, SetPasswordView, ResetPasswordView, LoginView, LogoutView, MeView, ForgotPasswordView
from ..views.user_views import UserProfileView, ChangePasswordView, RequestEmailChangeView, VerifyEmailChangeView, get_leaderboard
from ..views.quiz_views import get_user_quiz_history
from api.views.notification_views import get_user_notifications_db, delete_user_notification, mark_notification_read
urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('register-admin/', RegisterAdminView.as_view(), name='register_admin'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('set-password/', SetPasswordView.as_view(), name='set_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('request-email-change/', RequestEmailChangeView.as_view(), name='request_email_change'),
    path('verify-email-change/', VerifyEmailChangeView.as_view(), name='verify_email_change'),
    path('quiz-history/', get_user_quiz_history, name='user_quiz_history'),
    path('leaderboard/', get_leaderboard, name='leaderboard'),
    path('notifications/db/', get_user_notifications_db, name='user_notifications_db'),
    path('notifications/mark-read/', mark_notification_read, name='user_notification_mark_read'),
    path('notifications/<int:notif_id>/delete/', delete_user_notification, name='user_notification_delete'),
]
