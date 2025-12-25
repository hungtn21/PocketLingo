#!/usr/bin/env python
"""Script to create sample courses for testing"""
import os
import django
from pathlib import Path

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
import sys
sys.path.insert(0, str(BASE_DIR))

django.setup()

from api.models.course import Course

def create_sample_courses():
    """Create sample courses"""
    
    # Check if courses already exist
    existing_count = Course.objects.count()
    print(f"Existing courses: {existing_count}")
    
    if existing_count > 0:
        print("Courses already exist in database. Skipping creation.")
        return
    
    # Sample courses data
    courses_data = [
        {
            'title': 'Tiếng Anh Sơ Cấp cho Người Mới Bắt Đầu',
            'description': 'Khóa học Tiếng Anh cơ bản dành cho những người mới bắt đầu học Tiếng Anh.',
            'language': 'English',
            'level': 'Sơ cấp',
            'image_url': 'https://res.cloudinary.com/dytfwdgzc/image/upload/v1763305039/highlight1_haa3hk.jpg'
        },
        {
            'title': 'Tiếng Anh Trung Cấp',
            'description': 'Khóa học Tiếng Anh trung cấp giúp bạn nâng cao kỹ năng giao tiếp.',
            'language': 'English',
            'level': 'Trung cấp',
            'image_url': 'https://res.cloudinary.com/dytfwdgzc/image/upload/v1763305039/highlight1_haa3hk.jpg'
        },
        {
            'title': 'Tiếng Nhật Sơ Cấp',
            'description': 'Học tiếng Nhật từ đầu với giáo viên chuyên nghiệp.',
            'language': 'Japanese',
            'level': 'Sơ cấp',
            'image_url': 'https://res.cloudinary.com/dytfwdgzc/image/upload/v1763305039/highlight1_haa3hk.jpg'
        },
        {
            'title': 'Tiếng Nhật Trung Cấp',
            'description': 'Nâng cao kỹ năng tiếng Nhật của bạn với khóa học này.',
            'language': 'Japanese',
            'level': 'Trung cấp',
            'image_url': 'https://res.cloudinary.com/dytfwdgzc/image/upload/v1763305039/highlight1_haa3hk.jpg'
        },
        {
            'title': 'Tiếng Nhật Cao Cấp',
            'description': 'Tiếng Nhật nâng cao để giao tiếp như người bản xứ.',
            'language': 'Japanese',
            'level': 'Cao cấp',
            'image_url': 'https://res.cloudinary.com/dytfwdgzc/image/upload/v1763305039/highlight1_haa3hk.jpg'
        },
        {
            'title': 'Tiếng Anh Giao Tiếp Hàng Ngày',
            'description': 'Khóa học tập trung vào giao tiếp tiếng Anh trong đời sống hàng ngày.',
            'language': 'English',
            'level': 'Sơ cấp',
            'image_url': 'https://res.cloudinary.com/dytfwdgzc/image/upload/v1763305039/highlight1_haa3hk.jpg'
        },
    ]
    
    created_count = 0
    for course_data in courses_data:
        try:
            course = Course.objects.create(**course_data)
            print(f"✓ Created course: {course.title}")
            created_count += 1
        except Exception as e:
            print(f"✗ Error creating course {course_data['title']}: {e}")
    
    print(f"\nTotal courses created: {created_count}")
    print(f"Total courses in database: {Course.objects.count()}")

if __name__ == '__main__':
    create_sample_courses()
