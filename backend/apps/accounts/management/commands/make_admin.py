from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Promote an existing user to the ADMIN role (needed to use the admin dashboard)."

    def add_arguments(self, parser):
        parser.add_argument("email", help="Email of the user to promote")

    def handle(self, *args, **options):
        User = get_user_model()
        email = options["email"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise CommandError(f"No user found with email '{email}'. Register that account first.")

        user.role = User.Role.ADMIN
        user.is_staff = True
        user.save(update_fields=["role", "is_staff"])
        self.stdout.write(self.style.SUCCESS(f"'{user.email}' is now an ADMIN."))
