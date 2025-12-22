from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_add_userlesson_milestone_xp_awarded'),
    ]

    operations = [
        migrations.AddField(
            model_name='usercourse',
            name='completion_xp_awarded',
            field=models.BooleanField(default=False),
        ),
    ]
