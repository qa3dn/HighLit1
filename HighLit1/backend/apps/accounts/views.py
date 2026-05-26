from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from common.permissions import IsAdmin, IsSelfOrAdmin
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer

User = get_user_model()

MAX_REPUTATION_DELTA = 100


def _issue_tokens(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "access_token": str(refresh.access_token),
        "refresh_token": str(refresh),
        "user": UserSerializer(user).data,
    }


class HealthView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "django-auth"})


class GitHubPlaceholderView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(
            {"detail": "GitHub OAuth is not configured in this MVP backend."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(_issue_tokens(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            username=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        # Same generic response whether the email exists or the password is
        # wrong — avoids account enumeration.
        if not user or not user.is_active:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(_issue_tokens(user))


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = User.objects.all().order_by("-id")
        search = self.request.query_params.get("q")
        if search:
            qs = qs.filter(username__icontains=search) | qs.filter(email__icontains=search)
        return qs


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        # Anyone may read a public profile; only the user themselves (or an
        # admin) may modify or delete it. Closes the previous IDOR where any
        # authenticated user could PATCH/DELETE any account.
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsSelfOrAdmin()]


class UserRankView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        return Response({"rank": user.rank, "reputation_points": user.reputation_points})


class UserReputationView(APIView):
    # Reputation is a privilege-bearing score: only admins may adjust it, and
    # the delta is clamped so a single call can't mint unlimited points.
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        from apps.audit.services import record_event  # local import avoids load-order coupling

        user = get_object_or_404(User, pk=pk)
        try:
            points = int(request.data.get("points", 0))
        except (TypeError, ValueError):
            return Response({"detail": "points must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
        points = max(-MAX_REPUTATION_DELTA, min(MAX_REPUTATION_DELTA, points))
        from django.db.models import F

        User.objects.filter(pk=user.pk).update(reputation_points=F("reputation_points") + points)
        user.refresh_from_db(fields=["reputation_points"])
        record_event(
            request.user,
            "user.reputation_changed",
            target_type="user",
            target_id=str(user.pk),
            payload={"delta": points, "result": user.reputation_points},
            request=request,
        )
        return Response({"reputation_points": user.reputation_points})


class UserRoleView(APIView):
    """Admin-only role assignment (the only path that can set ``role``)."""

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        from apps.audit.services import record_event

        user = get_object_or_404(User, pk=pk)
        role = request.data.get("role")
        if role not in User.Role.values:
            return Response(
                {"detail": f"role must be one of {list(User.Role.values)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        previous = user.role
        user.role = role
        user.save(update_fields=["role"])
        record_event(
            request.user,
            "user.role_changed",
            target_type="user",
            target_id=str(user.pk),
            payload={"from": previous, "to": role},
            request=request,
        )
        return Response(UserSerializer(user).data)


class UserBanView(APIView):
    """Admin-only ban / unban via the ``is_active`` flag."""

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        from apps.audit.services import record_event

        user = get_object_or_404(User, pk=pk)
        active = bool(request.data.get("is_active", False))
        user.is_active = active
        user.save(update_fields=["is_active"])
        record_event(
            request.user,
            "user.unbanned" if active else "user.banned",
            target_type="user",
            target_id=str(user.pk),
            request=request,
        )
        return Response({"id": user.pk, "is_active": user.is_active})
