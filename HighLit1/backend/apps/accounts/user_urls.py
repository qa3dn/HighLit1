from django.urls import path

from .views import (
    UserBanView,
    UserDetailView,
    UserListView,
    UserRankView,
    UserReputationView,
    UserRoleView,
)

urlpatterns = [
    path("", UserListView.as_view()),
    path("<int:pk>", UserDetailView.as_view()),
    path("<int:pk>/rank", UserRankView.as_view()),
    path("<int:pk>/reputation", UserReputationView.as_view()),
    path("<int:pk>/role", UserRoleView.as_view()),
    path("<int:pk>/ban", UserBanView.as_view()),
]
