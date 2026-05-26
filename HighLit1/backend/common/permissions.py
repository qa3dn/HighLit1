from rest_framework.permissions import SAFE_METHODS, BasePermission


def is_admin(user) -> bool:
    return bool(user and user.is_authenticated and user.role == "ADMIN")


class IsAdmin(BasePermission):
    """Platform administrators only."""

    def has_permission(self, request, view):
        return is_admin(request.user)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return is_admin(request.user)


class IsSelfOrAdmin(BasePermission):
    """Object-level: the acting user owns the object, or is an admin.

    Works for the User model (``obj`` is a user) and for any model exposing an
    ``owner``/``user``/``user_id`` attribute.
    """

    def has_object_permission(self, request, view, obj):
        if is_admin(request.user):
            return True
        owner_id = getattr(obj, "id", None) if obj.__class__.__name__ == "User" else (
            getattr(obj, "user_id", None) or getattr(obj, "owner_id", None)
        )
        return bool(request.user and request.user.is_authenticated and owner_id == request.user.id)


class IsOwnerOrAdmin(BasePermission):
    """Object-level ownership via ``user_id``/``owner_id`` (admins always pass)."""

    def has_object_permission(self, request, view, obj):
        if is_admin(request.user):
            return True
        owner_id = getattr(obj, "user_id", None) or getattr(obj, "owner_id", None)
        return bool(request.user and request.user.is_authenticated and owner_id == request.user.id)
