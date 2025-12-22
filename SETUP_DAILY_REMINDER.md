# Hướng Dẫn Setup Daily Reminder (Ôn Tập Hàng Ngày)

## 🎯 Tổng Quan
Hệ thống gửi thông báo hàng ngày nhắc nhở user ôn tập flashcard tồn đọng. Gồm 3 phần:
1. **Backend**: Script `send_daily_reminders.py` tạo notification
2. **Frontend**: Logic xử lý click trong `UserNotificationDropdown.tsx`
3. **Socket**: Gửi realtime notification nếu user online

---

## ✅ Checklist Cấu Hình

### 1. **Kiểm tra .env File**
Đảm bảo backend có đủ biến environment để gửi email:

```bash
# backend/.env
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Google App Password, không phải mật khẩu thường
DEFAULT_FROM_EMAIL=noreply@pocketlingo.com
FRONTEND_URL=http://localhost:5173      # Hoặc domain production
```

**Lưu ý Gmail:**
- Nếu dùng Gmail, bạn **phải tạo App Password** (không phải mật khẩu thường)
- Cách tạo: https://myaccount.google.com/apppasswords
- Bật 2-factor authentication trước

### 2. **Kiểm tra TIME_ZONE trong settings.py**
```python
# backend/backend/settings.py
TIME_ZONE = 'Asia/Ho_Chi_Minh'  # Để get datetime theo giờ Việt Nam
USE_TZ = True
```

### 3. **Cài đặt APScheduler hoặc Celery (Tùy chọn)**

#### **Cách 1: Dùng APScheduler (Đơn giản, Local)**
```bash
pip install django-apscheduler
```

Thêm vào `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    ...
    'django_apscheduler',
]
```

Tạo file `backend/api/management/commands/start_scheduler.py`:
```python
from django.core.management.base import BaseCommand
from django_apscheduler.schedulers import DjangoScheduler
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management import call_command
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Khởi động APScheduler để chạy send_daily_reminders hàng ngày'

    def handle(self, *args, **options):
        scheduler = DjangoScheduler()
        
        # Chạy lúc 7:00 sáng mỗi ngày
        scheduler.add_job(
            self.run_daily_reminders,
            trigger=CronTrigger(hour=7, minute=0),
            id='send_daily_reminders',
            name='Send Daily Review Reminders',
            replace_existing=True,
        )
        
        scheduler.start()
        self.stdout.write("✅ Scheduler started! Sẽ gửi reminder lúc 7:00 sáng mỗi ngày")
        
    def run_daily_reminders(self):
        try:
            call_command('send_daily_reminders')
            logger.info("✅ Daily reminders sent successfully")
        except Exception as e:
            logger.error(f"❌ Error sending daily reminders: {e}")
```

Chạy scheduler:
```bash
python manage.py start_scheduler
```

---

#### **Cách 2: Dùng Windows Task Scheduler (Production trên Windows)**
1. Mở **Task Scheduler**
2. Tạo **Basic Task**:
   - **Name**: PocketLingo Daily Reminder
   - **Trigger**: Daily at 7:00 AM
   - **Action**: 
     ```
     Program: C:\path\to\venv\Scripts\python.exe
     Arguments: C:\PocketLingo\backend\manage.py send_daily_reminders
     Start in: C:\PocketLingo\backend
     ```

---

#### **Cách 3: Dùng Linux Cron (Production trên Linux/VPS)**
Chạy:
```bash
crontab -e
```

Thêm dòng:
```cron
0 7 * * * cd /path/to/PocketLingo/backend && /path/to/venv/bin/python manage.py send_daily_reminders
```

Kiểm tra log:
```bash
cat /var/log/syslog | grep send_daily_reminders
```

---

### 4. **Kiểm tra Notification Model**
```python
# backend/api/models/notification.py
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    description = models.TextField()
    status = models.CharField(max_length=20, default=Notification.Status.UNREAD)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    # Optional: Thêm trường type để phân loại (khuyến khích)
    TYPE_CHOICES = [
        ('DAILY_REVIEW', 'Daily Review Reminder'),
        ('COURSE_APPROVED', 'Course Approved'),
        ('COURSE_REJECTED', 'Course Rejected'),
    ]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='DAILY_REVIEW', null=True, blank=True)
```

---

## 🧪 Test Locally

### **1. Chạy Command Manual**
```bash
cd backend
python manage.py send_daily_reminders
```

Expected output:
```
Đang quét Flashcard tồn đọng tính đến ngày 2025-12-22...
✅ Đã gửi nhắc nhở cho 5 người dùng.
```

### **2. Kiểm tra Notification Database**
```bash
python manage.py shell
>>> from api.models.notification import Notification
>>> Notification.objects.filter(description__contains='ôn tập').order_by('-created_at')[:5]
```

### **3. Kiểm tra Email Config**
```python
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail(
...     subject="Test Email",
...     message="Thử gửi email từ Django",
...     from_email="noreply@pocketlingo.com",
...     recipient_list=["your-email@gmail.com"],
... )
```

Output: `1` = gửi thành công, `0` = thất bại

---

## 🚀 Frontend Integration

### **Đã được cập nhật trong UserNotificationDropdown.tsx:**

```typescript
const handleClick = async (n: Notification) => {
  // Kiểm tra nếu là daily review notification
  const isReviewNotif = 
    n.message?.toLowerCase().includes('ôn tập') || 
    n.description?.toLowerCase().includes('review');
  
  if (isReviewNotif) {
    // ✅ Điều hướng tới /daily-review
    navigate('/daily-review');
  }
  // ... xử lý các notification loại khác
}
```

**Test:**
1. Nhân viên backend gửi notification: `python manage.py send_daily_reminders`
2. Vào app, click chuông notification
3. Kiểm tra: User phải được chuyển sang `/daily-review` page

---

## 🔔 Socket Realtime (Optional nhưng khuyến khích)

Khi user online lúc 7:00 sáng:
```python
# send_daily_reminders.py
send_user_notification(user.id, {
    "id": noti.id,
    "description": noti.description,
    "type": "DAILY_REVIEW"
})
```

→ Frontend nhận qua WebSocket → **Chuông notification tự động cập nhật** mà không cần F5

---

## 📊 Monitoring & Troubleshooting

### **Log Query**
```bash
# Kiểm tra user nào đã nhận notification hôm nay
python manage.py shell
>>> from datetime import datetime, timedelta
>>> from api.models.notification import Notification
>>> today = datetime.now().date()
>>> Notification.objects.filter(
...     created_at__date=today, 
...     description__contains='ôn tập'
... ).count()
```

### **Email Failed?**
- Kiểm tra `.env` có đúng email + password
- Gmail: Dùng **App Password**, không phải mật khẩu thường
- Check **FRONTEND_URL** trong settings.py

### **Cron Job không chạy?**
```bash
# Linux
ps aux | grep python  # Kiểm tra scheduler process
tail -f /var/log/syslog | grep send_daily_reminders

# Windows
tasklist | findstr python
```

---

## 📋 Tóm Tắt Workflow Hoàn Chỉnh

```
7:00 AM → Cron/Scheduler chạy send_daily_reminders
    ↓
Django tính toán flashcard tồn đọng của từng user
    ↓
Gửi Notification vào DB + Email
    ↓
Send socket realtime (nếu user online)
    ↓
Frontend nhận → Chuông notification cập nhật
    ↓
User click → Kiểm tra content → Chuyển sang /daily-review
    ↓
Giao diện học flashcard + tính điểm
```

---

## ✨ Next Steps
1. ✅ Update `UserNotificationDropdown.tsx` (DONE)
2. ⏳ Setup APScheduler hoặc Cron Job
3. ⏳ Test `python manage.py send_daily_reminders` 
4. ⏳ Verify email config
5. ⏳ Monitor logs trong 2-3 ngày đầu

Happy learning! 🎉
