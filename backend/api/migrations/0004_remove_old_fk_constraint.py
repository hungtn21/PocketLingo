# Generated manually to remove old foreign key constraint
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_alter_quizattempt_user'),
    ]

    operations = [
        # Chỉ xóa constraint cũ, không tạo constraint mới
        # Django sẽ quản lý mối quan hệ qua ORM
        migrations.RunSQL(
            sql="""
                SET @constraint_name = (
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'quiz_attempts' 
                    AND COLUMN_NAME = 'user_id'
                    AND REFERENCED_TABLE_NAME = 'auth_user'
                    LIMIT 1
                );
                SET @sql = IF(@constraint_name IS NOT NULL, 
                    CONCAT('ALTER TABLE quiz_attempts DROP FOREIGN KEY ', @constraint_name),
                    'SELECT 1'
                );
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
