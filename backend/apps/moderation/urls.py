from django.urls import path

from .views import ApprovePostView, ModerationQueueView, RejectPostView

urlpatterns = [
    path("queue", ModerationQueueView.as_view()),
    path("posts/<int:post_id>/approve", ApprovePostView.as_view()),
    path("posts/<int:post_id>/reject", RejectPostView.as_view()),
]
