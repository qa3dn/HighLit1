from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

DEMO_PASSWORD = "demo12345"

DEMO_USERS = [
    {"email": "admin@highlit.dev", "username": "demo_admin", "role": "ADMIN"},
    {"email": "company@highlit.dev", "username": "demo_company", "role": "COMPANY"},
    {"email": "student@highlit.dev", "username": "demo_student", "role": "USER"},
]


class Command(BaseCommand):
    help = "Create/refresh demo accounts used by the admin dashboard trial login."

    def handle(self, *args, **options):
        User = get_user_model()
        for spec in DEMO_USERS:
            user, created = User.objects.update_or_create(
                email=spec["email"],
                defaults={
                    "username": spec["username"],
                    "role": spec["role"],
                    "is_staff": spec["role"] == "ADMIN",
                    "is_active": True,
                },
            )
            user.set_password(DEMO_PASSWORD)
            user.save()
            verb = "created" if created else "updated"
            self.stdout.write(self.style.SUCCESS(f"{verb}: {user.email} ({user.role})"))
        self.stdout.write(self.style.SUCCESS(f"Demo password for all: {DEMO_PASSWORD}"))
