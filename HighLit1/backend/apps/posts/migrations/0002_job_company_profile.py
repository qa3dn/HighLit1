import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0001_initial"),
        ("companies", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="job",
            name="company_profile",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="jobs",
                to="companies.company",
            ),
        ),
    ]
