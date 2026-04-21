from django.urls import path

from .views import JobDetailView, JobListCreateView, JobLocationsView, JobReviewView

urlpatterns = [
    path("", JobListCreateView.as_view()),
    path("locations", JobLocationsView.as_view()),
    path("<int:pk>", JobDetailView.as_view()),
    path("<int:pk>/reviews", JobReviewView.as_view()),
]
