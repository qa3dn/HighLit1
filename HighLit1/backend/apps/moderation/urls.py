from django.urls import path

from .views import (
    AdminCommentDetailView,
    AdminCommentListView,
    AdminJobFeatureView,
    AdminJobListView,
    AdminPostDetailView,
    AdminPostListView,
    ApprovePostView,
    ModerationOverviewView,
    ModerationQueueView,
    RejectPostView,
)

urlpatterns = [
    path("overview", ModerationOverviewView.as_view()),
    path("queue", ModerationQueueView.as_view()),
    path("posts", AdminPostListView.as_view()),
    path("posts/<int:post_id>", AdminPostDetailView.as_view()),
    path("posts/<int:post_id>/approve", ApprovePostView.as_view()),
    path("posts/<int:post_id>/reject", RejectPostView.as_view()),
    path("comments", AdminCommentListView.as_view()),
    path("comments/<int:comment_id>", AdminCommentDetailView.as_view()),
    path("jobs", AdminJobListView.as_view()),
    path("jobs/<int:job_id>/feature", AdminJobFeatureView.as_view()),
]
