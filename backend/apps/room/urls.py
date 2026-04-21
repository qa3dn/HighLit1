from django.urls import path

from .views import (
    CodeStorageDetailView,
    CodeStorageListCreateView,
    DevNoteDetailView,
    DevNoteListCreateView,
    IdeaDetailView,
    IdeaListCreateView,
    MyRoomView,
    SavedItemListCreateView,
    StatusUpdateView,
    UserRoomView,
)

urlpatterns = [
    path("me", MyRoomView.as_view()),
    path("<int:user_id>", UserRoomView.as_view()),
    path("code-storage", CodeStorageListCreateView.as_view()),
    path("code-storage/<int:pk>", CodeStorageDetailView.as_view()),
    path("dev-notes", DevNoteListCreateView.as_view()),
    path("dev-notes/<int:pk>", DevNoteDetailView.as_view()),
    path("ideas", IdeaListCreateView.as_view()),
    path("ideas/<int:pk>", IdeaDetailView.as_view()),
    path("saved-items", SavedItemListCreateView.as_view()),
    path("status", StatusUpdateView.as_view()),
]
