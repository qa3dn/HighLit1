import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0005_approve_existing_companies"),
    ]

    operations = [
        migrations.CreateModel(
            name="PromoCode",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=40, unique=True)),
                (
                    "discount_type",
                    models.CharField(
                        choices=[("PERCENT", "Percent"), ("FIXED", "Fixed")],
                        default="PERCENT",
                        max_length=10,
                    ),
                ),
                ("amount", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("valid_from", models.DateTimeField(blank=True, null=True)),
                ("valid_until", models.DateTimeField(blank=True, null=True)),
                ("max_uses", models.PositiveIntegerField(blank=True, null=True)),
                ("used_count", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "plan",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="promo_codes",
                        to="companies.subscriptionplan",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
