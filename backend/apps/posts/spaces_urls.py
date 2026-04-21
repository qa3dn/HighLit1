from django.urls import path

from .views import SpaceDetailView, SpaceEndView, SpaceListCreateView, SpaceLiveView, SpaceStartView

urlpatterns = [
    path("", SpaceListCreateView.as_view()),
    path("live", SpaceLiveView.as_view()),
    path("<int:pk>", SpaceDetailView.as_view()),
    path("<int:pk>/start", SpaceStartView.as_view()),
    path("<int:pk>/end", SpaceEndView.as_view()),
]
