from django.urls import path

from apps.realtime.consumers import SpaceConsumer

websocket_urlpatterns = [
    path("ws/spaces/<str:space_id>/", SpaceConsumer.as_asgi()),
]
