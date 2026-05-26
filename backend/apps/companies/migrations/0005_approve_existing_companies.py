from django.db import migrations


def approve_existing(apps, schema_editor):
    # Companies that existed before the approval workflow are grandfathered in
    # as APPROVED so they stay publicly visible.
    Company = apps.get_model("companies", "Company")
    Company.objects.update(status="APPROVED")


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("companies", "0004_company_review_note_company_status_and_more"),
    ]

    operations = [
        migrations.RunPython(approve_existing, noop),
    ]
