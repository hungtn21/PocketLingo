# Generated manually to remove all old auth_user foreign key constraints
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_remove_user_lessons_old_fk'),
    ]

    operations = [
        # Xóa constraint của notifications.user_id
        migrations.RunSQL(
            sql="""
                SET @constraint_name = (
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'notifications' 
                    AND COLUMN_NAME = 'user_id'
                    AND REFERENCED_TABLE_NAME = 'auth_user'
                    LIMIT 1
                );
                SET @sql = IF(@constraint_name IS NOT NULL, 
                    CONCAT('ALTER TABLE notifications DROP FOREIGN KEY ', @constraint_name),
                    'SELECT 1'
                );
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
        # Xóa constraint của courses.created_by
        migrations.RunSQL(
            sql="""
                SET @constraint_name = (
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'courses' 
                    AND COLUMN_NAME = 'created_by'
                    AND REFERENCED_TABLE_NAME = 'auth_user'
                    LIMIT 1
                );
                SET @sql = IF(@constraint_name IS NOT NULL, 
                    CONCAT('ALTER TABLE courses DROP FOREIGN KEY ', @constraint_name),
                    'SELECT 1'
                );
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
        # Xóa constraint của user_flashcards.user_id
        migrations.RunSQL(
            sql="""
                SET @constraint_name = (
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'user_flashcards' 
                    AND COLUMN_NAME = 'user_id'
                    AND REFERENCED_TABLE_NAME = 'auth_user'
                    LIMIT 1
                );
                SET @sql = IF(@constraint_name IS NOT NULL, 
                    CONCAT('ALTER TABLE user_flashcards DROP FOREIGN KEY ', @constraint_name),
                    'SELECT 1'
                );
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
