from django.urls import path

from .views import UserDetailView, UserListView, UserRankView, UserReputationView

urlpatterns = [
    path("", UserListView.as_view()),
    path("<int:pk>", UserDetailView.as_view()),
    path("<int:pk>/rank", UserRankView.as_view()),
    path("<int:pk>/reputation", UserReputationView.as_view()),
]
