from django.urls import path

from .views import (
    DailyStatsView,
    PostCommentView,
    PostDetailView,
    PostListCreateView,
    PostReactionView,
    PostsByTagView,
    RantsView,
    TagsView,
    TrendingView,
)

urlpatterns = [
    path("", PostListCreateView.as_view()),
    path("rants", RantsView.as_view()),
    path("trending", TrendingView.as_view()),
    path("tags", TagsView.as_view()),
    path("tags/<str:tag>", PostsByTagView.as_view()),
    path("stats/daily", DailyStatsView.as_view()),
    path("<int:pk>", PostDetailView.as_view()),
    path("<int:pk>/reactions", PostReactionView.as_view()),
    path("<int:pk>/comments", PostCommentView.as_view()),
]
