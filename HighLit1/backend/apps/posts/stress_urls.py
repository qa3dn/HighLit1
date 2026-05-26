from django.urls import path

from .views import StressView

urlpatterns = [
    path("", StressView.as_view()),
]
