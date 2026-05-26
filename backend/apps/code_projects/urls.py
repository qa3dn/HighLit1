from django.urls import path

from .views import (
    CodeProjectDetailView,
    CodeProjectDownloadView,
    CodeProjectFileDetailView,
    CodeProjectFileListCreateView,
    CodeProjectListCreateView,
    CodeProjectUpdatesView,
    MyCodeProjectsView,
)

urlpatterns = [
    path("", CodeProjectListCreateView.as_view()),
    path("mine", MyCodeProjectsView.as_view()),
    path("<slug:slug>", CodeProjectDetailView.as_view()),
    path("<slug:slug>/files", CodeProjectFileListCreateView.as_view()),
    path("<slug:slug>/files/<int:file_id>", CodeProjectFileDetailView.as_view()),
    path("<slug:slug>/updates", CodeProjectUpdatesView.as_view()),
    path("<slug:slug>/download", CodeProjectDownloadView.as_view()),
]
