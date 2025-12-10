# Generated manually to fix user_lessons foreign key constraints
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_remove_old_fk_constraint'),
    ]

    operations = [
        # Xóa constraint cũ của user_lessons.user_id trỏ đến auth_user
        migrations.RunSQL(
            sql="""
                SET @constraint_name = (
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'user_lessons' 
                    AND COLUMN_NAME = 'user_id'
                    AND REFERENCED_TABLE_NAME = 'auth_user'
                    LIMIT 1
                );
                SET @sql = IF(@constraint_name IS NOT NULL, 
                    CONCAT('ALTER TABLE user_lessons DROP FOREIGN KEY ', @constraint_name),
                    'SELECT 1'
                );
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
