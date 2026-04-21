from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/users/", include("apps.accounts.user_urls")),
    path("api/v1/posts/", include("apps.posts.urls")),
    path("api/v1/jobs/", include("apps.posts.jobs_urls")),
    path("api/v1/spaces/", include("apps.posts.spaces_urls")),
    path("api/v1/stress/", include("apps.posts.stress_urls")),
    path("api/v1/room/", include("apps.room.urls")),
    path("api/v1/moderation/", include("apps.moderation.urls")),
    path("api/v1/uploads/", include("apps.uploads.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
