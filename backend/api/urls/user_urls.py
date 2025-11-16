from django.urls import path
from ..views.user_views import RegisterUserView, VerifyEmailView, SetPasswordView, ResetPasswordView, LoginView, LogoutView, MeView, ForgotPasswordView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('set-password/', SetPasswordView.as_view(), name='set_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
]
