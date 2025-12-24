from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0012_remove_bookmark_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="usercourse",
            name="reviewed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
