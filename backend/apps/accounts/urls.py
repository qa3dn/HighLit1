from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import GitHubPlaceholderView, HealthView, LoginView, MeView, RegisterView

urlpatterns = [
    path("health", HealthView.as_view()),
    path("github", GitHubPlaceholderView.as_view()),
    path("github/callback", GitHubPlaceholderView.as_view()),
    path("register", RegisterView.as_view()),
    path("login", LoginView.as_view()),
    path("refresh", TokenRefreshView.as_view()),
    path("me", MeView.as_view()),
]
