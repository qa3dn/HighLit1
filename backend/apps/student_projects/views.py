from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import record_event

from .models import StudentProject
from .permissions import IsAdmin, IsOwnerOrAdmin
from .serializers import (
    RejectProjectSerializer,
    StudentProjectCreateSerializer,
    StudentProjectSerializer,
)


class StudentProjectListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StudentProjectCreateSerializer
        return StudentProjectSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            StudentProjectSerializer(instance).data,
            status=status.HTTP_201_CREATED,
        )

    def get_queryset(self):
        qs = StudentProject.objects.select_related("user").all()
        if self.request.method == "GET":
            if self.request.user.is_authenticated and self.request.user.role == "ADMIN":
                status_filter = self.request.query_params.get("status")
                if status_filter:
                    qs = qs.filter(status=status_filter)
            else:
                qs = qs.filter(status=StudentProject.Status.PUBLISHED)

            university = self.request.query_params.get("university")
            major = self.request.query_params.get("major")
            year = self.request.query_params.get("year")
            project_type = self.request.query_params.get("project_type")
            q = self.request.query_params.get("q")

            if university:
                qs = qs.filter(university__icontains=university)
            if major:
                qs = qs.filter(major__icontains=major)
            if year:
                qs = qs.filter(academic_year__icontains=year)
            if project_type:
                qs = qs.filter(project_type=project_type)
            if q:
                qs = qs.filter(
                    Q(title__icontains=q)
                    | Q(summary__icontains=q)
                    | Q(description__icontains=q)
                    | Q(university__icontains=q)
                    | Q(major__icontains=q)
                )

            ordering = self.request.query_params.get("ordering", "-created_at")
            if ordering.lstrip("-") in ("created_at", "view_count", "title"):
                qs = qs.order_by(ordering)
            else:
                qs = qs.order_by("-created_at")

        return qs


class StudentProjectMineView(generics.ListAPIView):
    serializer_class = StudentProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudentProject.objects.filter(user=self.request.user).select_related("user")


class StudentProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentProject.objects.select_related("user")
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return StudentProjectCreateSerializer
        return StudentProjectSerializer

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.AllowAny()]

    def get_object(self):
        obj = super().get_object()
        if self.request.method == "GET":
            if obj.status != StudentProject.Status.PUBLISHED:
                if not self.request.user.is_authenticated:
                    from rest_framework.exceptions import NotFound

                    raise NotFound()
                if obj.user_id != self.request.user.id and self.request.user.role != "ADMIN":
                    from rest_framework.exceptions import NotFound

                    raise NotFound()
            if obj.status == StudentProject.Status.PUBLISHED:
                StudentProject.objects.filter(pk=obj.pk).update(view_count=obj.view_count + 1)
                obj.refresh_from_db()
        return obj


class StudentProjectFacetsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        published = StudentProject.objects.filter(status=StudentProject.Status.PUBLISHED)
        universities = (
            published.exclude(university="")
            .values_list("university", flat=True)
            .distinct()
            .order_by("university")
        )
        majors = (
            published.exclude(major="")
            .values_list("major", flat=True)
            .distinct()
            .order_by("major")
        )
        return Response({"universities": list(universities), "majors": list(majors)})


class HideProjectView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        project = get_object_or_404(StudentProject, pk=pk)
        project.status = StudentProject.Status.HIDDEN
        project.save(update_fields=["status", "updated_at"])
        record_event(
            request.user, "project.hidden", target_type="project", target_id=str(project.pk), request=request
        )
        return Response(StudentProjectSerializer(project).data)


class RejectProjectView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        project = get_object_or_404(StudentProject, pk=pk)
        serializer = RejectProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project.status = StudentProject.Status.REJECTED
        project.rejection_reason = serializer.validated_data.get("reason", "")
        project.save(update_fields=["status", "rejection_reason", "updated_at"])
        record_event(
            request.user,
            "project.rejected",
            target_type="project",
            target_id=str(project.pk),
            payload={"reason": project.rejection_reason},
            request=request,
        )
        return Response(StudentProjectSerializer(project).data)


class ApproveProjectView(APIView):
    """Admin restores a hidden/rejected project to PUBLISHED (clears any
    rejection reason). Records an audit event."""

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        project = get_object_or_404(StudentProject, pk=pk)
        project.status = StudentProject.Status.PUBLISHED
        project.rejection_reason = ""
        project.save(update_fields=["status", "rejection_reason", "updated_at"])
        record_event(
            request.user, "project.approved", target_type="project", target_id=str(project.pk), request=request
        )
        return Response(StudentProjectSerializer(project).data)
