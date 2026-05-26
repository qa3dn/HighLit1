from django.urls import path

from .profile_views import GithubReposView, PublicProfileView

urlpatterns = [
    path("github-repos", GithubReposView.as_view()),
    path("<int:user_id>", PublicProfileView.as_view()),
]
