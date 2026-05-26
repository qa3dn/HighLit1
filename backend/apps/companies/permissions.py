from rest_framework import permissions

from common.permissions import is_admin
from .models import CompanyMember


def is_company_manager(user, company) -> bool:
    """A user manages a company if they own it, are a platform admin, or hold
    an OWNER/ADMIN membership."""
    if not (user and user.is_authenticated):
        return False
    if is_admin(user) or company.owner_id == user.id:
        return True
    return CompanyMember.objects.filter(
        company=company,
        user=user,
        role__in=(CompanyMember.Role.OWNER, CompanyMember.Role.ADMIN),
    ).exists()


class IsCompanyManagerOrReadOnly(permissions.BasePermission):
    """Read is open; writes require company-manager rights on the object."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        company = obj if obj.__class__.__name__ == "Company" else getattr(obj, "company", None)
        return bool(company and is_company_manager(request.user, company))
