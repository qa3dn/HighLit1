from django.urls import path

from .views import (
    HideProjectView,
    RejectProjectView,
    StudentProjectDetailView,
    StudentProjectFacetsView,
    StudentProjectListCreateView,
    StudentProjectMineView,
)

urlpatterns = [
    path("", StudentProjectListCreateView.as_view()),
    path("mine", StudentProjectMineView.as_view()),
    path("facets", StudentProjectFacetsView.as_view()),
    path("<int:pk>", StudentProjectDetailView.as_view()),
    path("<int:pk>/hide", HideProjectView.as_view()),
    path("<int:pk>/reject", RejectProjectView.as_view()),
]
