from django.urls import path

from .views import (
    JobApplicantsView,
    JobApplicationDetailView,
    JobApplyView,
    JobDetailView,
    JobListCreateView,
    JobLocationsView,
    JobReviewView,
    MyApplicationsView,
    MyJobsView,
)

urlpatterns = [
    path("", JobListCreateView.as_view()),
    path("locations", JobLocationsView.as_view()),
    path("mine", MyJobsView.as_view()),
    path("my-applications", MyApplicationsView.as_view()),
    path("applications/<int:app_id>", JobApplicationDetailView.as_view()),
    path("<int:pk>", JobDetailView.as_view()),
    path("<int:pk>/apply", JobApplyView.as_view()),
    path("<int:pk>/applicants", JobApplicantsView.as_view()),
    path("<int:pk>/reviews", JobReviewView.as_view()),
]
