import io
import uuid
import zipfile

from django.db.models import Count, F, Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from common.pagination import DefaultPagination
from common.permissions import is_admin
from .models import CodeProject, CodeProjectFile
from .serializers import (
    CodeProjectDetailSerializer,
    CodeProjectFileSerializer,
    CodeProjectListSerializer,
    CodeProjectUpdateSerializer,
    CodeProjectWriteSerializer,
)

MAX_FILES_PER_PROJECT = 100


def annotate_files(queryset):
    return queryset.annotate(file_count=Count("files", distinct=True))


def unique_slug(name: str) -> str:
    base = slugify(name, allow_unicode=False) or f"project-{uuid.uuid4().hex[:8]}"
    slug = base
    suffix = 1
    while CodeProject.objects.filter(slug=slug).exists():
        suffix += 1
        slug = f"{base}-{suffix}"
    return slug


def can_view(project, user) -> bool:
    if project.visibility != CodeProject.Visibility.PRIVATE:
        return True  # PUBLIC and UNLISTED are viewable by direct link
    return bool(user.is_authenticated and (user.id == project.owner_id or is_admin(user)))


class CodeProjectListCreateView(generics.ListCreateAPIView):
    pagination_class = DefaultPagination

    def get_serializer_class(self):
        return CodeProjectWriteSerializer if self.request.method == "POST" else CodeProjectListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_throttles(self):
        if self.request.method == "POST":
            self.throttle_scope = "post"
            return [ScopedRateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        # Public listing only ever exposes PUBLIC projects (UNLISTED are hidden
        # from lists by design; PRIVATE never appear).
        qs = annotate_files(
            CodeProject.objects.select_related("owner").filter(
                visibility=CodeProject.Visibility.PUBLIC
            )
        )
        params = self.request.query_params
        if params.get("user_id"):
            qs = qs.filter(owner_id=params["user_id"])
        if params.get("language"):
            qs = qs.filter(language__icontains=params["language"])
        if params.get("tag"):
            qs = qs.filter(tags__contains=[params["tag"]])
        if params.get("q"):
            q = params["q"]
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))
        return qs.order_by("-updated_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save(owner=request.user, slug=unique_slug(serializer.validated_data["name"]))
        return Response(
            CodeProjectDetailSerializer(project, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class MyCodeProjectsView(generics.ListAPIView):
    serializer_class = CodeProjectListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return annotate_files(
            CodeProject.objects.select_related("owner").filter(owner=self.request.user)
        ).order_by("-updated_at")


class CodeProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    lookup_field = "slug"
    serializer_class = CodeProjectDetailSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return CodeProjectWriteSerializer
        return CodeProjectDetailSerializer

    def get_queryset(self):
        return annotate_files(
            CodeProject.objects.select_related("owner").prefetch_related("files", "updates")
        )

    def get_object(self):
        project = get_object_or_404(self.get_queryset(), slug=self.kwargs["slug"])
        if self.request.method in permissions.SAFE_METHODS:
            if not can_view(project, self.request.user):
                raise NotFound()
            if project.visibility == CodeProject.Visibility.PUBLIC:
                CodeProject.objects.filter(pk=project.pk).update(view_count=F("view_count") + 1)
        else:
            if not (self.request.user.id == project.owner_id or is_admin(self.request.user)):
                raise PermissionDenied("هذا المشروع ليس لك.")
        return project

    def update(self, request, *args, **kwargs):
        project = self.get_object()
        serializer = CodeProjectWriteSerializer(
            project, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        project.refresh_from_db()
        return Response(CodeProjectDetailSerializer(project, context={"request": request}).data)


class CodeProjectFileListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _owned_project(self, request, slug):
        project = get_object_or_404(CodeProject, slug=slug)
        if not (request.user.id == project.owner_id or is_admin(request.user)):
            raise PermissionDenied("هذا المشروع ليس لك.")
        return project

    def post(self, request, slug):
        project = self._owned_project(request, slug)
        if project.files.count() >= MAX_FILES_PER_PROJECT:
            return Response(
                {"detail": f"الحد الأقصى {MAX_FILES_PER_PROJECT} ملف للمشروع."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = CodeProjectFileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        path = serializer.validated_data["path"]
        if project.files.filter(path=path).exists():
            return Response({"detail": "يوجد ملف بهذا المسار."}, status=status.HTTP_400_BAD_REQUEST)
        file = serializer.save(project=project)
        return Response(CodeProjectFileSerializer(file).data, status=status.HTTP_201_CREATED)


class CodeProjectFileDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _file(self, request, slug, file_id):
        project = get_object_or_404(CodeProject, slug=slug)
        if not (request.user.id == project.owner_id or is_admin(request.user)):
            raise PermissionDenied("هذا المشروع ليس لك.")
        return get_object_or_404(CodeProjectFile, pk=file_id, project=project)

    def patch(self, request, slug, file_id):
        file = self._file(request, slug, file_id)
        serializer = CodeProjectFileSerializer(file, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, slug, file_id):
        file = self._file(request, slug, file_id)
        file.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CodeProjectUpdatesView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, slug):
        project = get_object_or_404(CodeProject, slug=slug)
        if not can_view(project, request.user):
            raise NotFound()
        return Response(CodeProjectUpdateSerializer(project.updates.all(), many=True).data)

    def post(self, request, slug):
        project = get_object_or_404(CodeProject, slug=slug)
        if not (request.user.id == project.owner_id or is_admin(request.user)):
            raise PermissionDenied("هذا المشروع ليس لك.")
        serializer = CodeProjectUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(project=project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CodeProjectDownloadView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        project = get_object_or_404(
            CodeProject.objects.prefetch_related("files"), slug=slug
        )
        if not can_view(project, request.user):
            raise NotFound()

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
            if project.readme:
                archive.writestr("README.md", project.readme)
            for file in project.files.all():
                # Paths are already validated on write, so this is traversal-safe.
                archive.writestr(file.path, file.content)
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type="application/zip")
        response["Content-Disposition"] = f'attachment; filename="{project.slug}.zip"'
        return response
