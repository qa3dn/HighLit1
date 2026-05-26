from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/users/", include("apps.accounts.user_urls")),
    path("api/v1/profiles/", include("apps.accounts.profile_urls")),
    path("api/v1/posts/", include("apps.posts.urls")),
    path("api/v1/jobs/", include("apps.posts.jobs_urls")),
    path("api/v1/spaces/", include("apps.posts.spaces_urls")),
    path("api/v1/stress/", include("apps.posts.stress_urls")),
    path("api/v1/room/", include("apps.room.urls")),
    path("api/v1/moderation/", include("apps.moderation.urls")),
    path("api/v1/uploads/", include("apps.uploads.urls")),
    path("api/v1/student-projects/", include("apps.student_projects.urls")),
    path("api/v1/companies/", include("apps.companies.urls")),
    path("api/v1/audit/", include("apps.audit.urls")),
    path("api/v1/code-projects/", include("apps.code_projects.urls")),
]

# Interactive API docs are exposed only in DEBUG (dev/staging), never in prod.
if settings.DEBUG:
    urlpatterns += [
        path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
        path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
