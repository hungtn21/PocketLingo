"""
Test script để kiểm tra Daily Reminder setup
Sử dụng: python manage.py shell < test_daily_reminder.py
"""

from datetime import datetime, timedelta
from api.models.user import User
from api.models.notification import Notification
from api.models.flashcard import UserFlashcard
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import os

def test_email_config():
    """Kiểm tra email config"""
    print("=" * 60)
    print("📧 TEST 1: Email Configuration")
    print("=" * 60)
    
    email_host = getattr(settings, 'EMAIL_HOST', 'Not set')
    email_port = getattr(settings, 'EMAIL_PORT', 'Not set')
    email_user = getattr(settings, 'EMAIL_HOST_USER', 'Not set')
    email_password = '***' if getattr(settings, 'EMAIL_HOST_PASSWORD', None) else 'Not set'
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Not set')
    
    print(f"✅ EMAIL_HOST: {email_host}")
    print(f"✅ EMAIL_PORT: {email_port}")
    print(f"✅ EMAIL_HOST_USER: {email_user}")
    print(f"✅ EMAIL_HOST_PASSWORD: {email_password}")
    print(f"✅ DEFAULT_FROM_EMAIL: {from_email}")
    print(f"✅ TIME_ZONE: {settings.TIME_ZONE}")
    
    if email_user == 'Not set' or email_password == 'Not set':
        print("⚠️  WARNING: Email not configured! Set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env")
        return False
    
    print("✅ Email config looks good!\n")
    return True

def test_send_test_email():
    """Gửi email test"""
    print("=" * 60)
    print("📨 TEST 2: Send Test Email")
    print("=" * 60)
    
    try:
        result = send_mail(
            subject="[PocketLingo] Test Email - Notification System",
            message="Nếu nhận được email này, hệ thống notification hoạt động bình thường!",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],  # Gửi cho chính email đó
            fail_silently=False,
        )
        
        if result == 1:
            print("✅ Test email sent successfully!")
            print(f"📬 Check your inbox: {settings.EMAIL_HOST_USER}\n")
            return True
        else:
            print("❌ Email not sent (fail_silently=False but returned 0)\n")
            return False
            
    except Exception as e:
        print(f"❌ Error sending email: {e}\n")
        return False

def test_flashcard_data():
    """Kiểm tra dữ liệu flashcard tồn đọng"""
    print("=" * 60)
    print("📚 TEST 3: Flashcard Data Check")
    print("=" * 60)
    
    today = timezone.now().date()
    last_month = timezone.now() - timedelta(days=30)
    
    # Tìm user có flashcard tồn đọng
    users_with_due = User.objects.filter(
        status='ACTIVE',
        last_login__gte=last_month
    ).distinct()
    
    print(f"Total active users (login in last 30 days): {users_with_due.count()}")
    
    # Kiểm tra flashcard tồn đọng
    due_flashcards = UserFlashcard.objects.filter(
        next_review_date__lte=today
    ).values('user').distinct().count()
    
    print(f"Users with due flashcards: {due_flashcards}")
    
    # Chi tiết
    if due_flashcards > 0:
        print("\nUsers with overdue cards:")
        users = User.objects.filter(
            user_flashcards__next_review_date__lte=today
        ).distinct()[:5]
        for user in users:
            count = user.user_flashcards.filter(next_review_date__lte=today).count()
            print(f"  - {user.name} ({user.email}): {count} cards due")
    else:
        print("⚠️  No overdue flashcards found. System won't send notifications.")
    
    print()
    return due_flashcards > 0

def test_notification_model():
    """Kiểm tra Notification model"""
    print("=" * 60)
    print("📬 TEST 4: Notification Model Check")
    print("=" * 60)
    
    try:
        # Thử tạo notification test
        test_user = User.objects.filter(status='ACTIVE').first()
        
        if not test_user:
            print("⚠️  No active users found in database")
            return False
        
        notif = Notification.objects.create(
            user=test_user,
            description="Test notification - Bạn có 5 từ cần ôn tập hôm nay. Bắt đầu ngay!",
            status='UNREAD'
        )
        
        print(f"✅ Test notification created: {notif.id}")
        print(f"✅ User: {test_user.name}")
        print(f"✅ Description: {notif.description}")
        print(f"✅ Created at: {notif.created_at}")
        
        # Clean up
        notif.delete()
        print("✅ Test notification deleted\n")
        
        return True
        
    except Exception as e:
        print(f"❌ Error with Notification model: {e}\n")
        return False

def test_django_apscheduler():
    """Kiểm tra django_apscheduler installed"""
    print("=" * 60)
    print("⏰ TEST 5: APScheduler Installation Check")
    print("=" * 60)
    
    try:
        import django_apscheduler
        from apscheduler.schedulers.background import BackgroundScheduler
        
        print("✅ django_apscheduler: installed")
        print("✅ APScheduler: installed")
        print("\nYou can run scheduler with:")
        print("  python manage.py start_scheduler\n")
        
        return True
        
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("\nInstall with:")
        print("  pip install django-apscheduler APScheduler\n")
        return False

def main():
    print("\n" + "=" * 60)
    print("🧪 POCKETLINGO DAILY REMINDER SYSTEM - TEST SUITE")
    print("=" * 60 + "\n")
    
    results = {
        "Email Config": test_email_config(),
        "Send Test Email": test_send_test_email(),
        "Flashcard Data": test_flashcard_data(),
        "Notification Model": test_notification_model(),
        "APScheduler": test_django_apscheduler(),
    }
    
    print("=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    total = len(results)
    passed = sum(1 for r in results.values() if r)
    
    print(f"\nPassed: {passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed! System is ready for Daily Reminders")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check output above.")
    
    print("=" * 60 + "\n")

if __name__ == '__main__':
    main()
