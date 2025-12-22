from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_remove_userflashcard_user_flashc_user_id_b49250_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userlesson',
            name='milestone_xp_awarded',
            field=models.BooleanField(default=False),
        ),
    ]
