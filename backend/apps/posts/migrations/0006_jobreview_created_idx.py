from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0005_jobapplication_alter_job_options_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="jobreview",
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="jobreview",
            index=models.Index(fields=["-created_at"], name="jobreview_created_idx"),
        ),
    ]
