# 🚀 Quick Start: Daily Reminder Notification System

## ⚡ Setup nhanh (5 phút)

### 1. **Cài đặt APScheduler**
```bash
cd backend
pip install -r requirements.txt
# hoặc nếu không muốn update từ file:
# pip install django-apscheduler APScheduler
```

### 2. **Thêm vào INSTALLED_APPS** (backend/settings.py)
```python
INSTALLED_APPS = [
    ...
    'django_apscheduler',
]
```

### 3. **Kiểm tra .env có đủ email config**
```bash
# backend/.env
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@pocketlingo.com
TIME_ZONE=Asia/Ho_Chi_Minh
```

### 4. **Chạy scheduler (Development)**
```bash
python manage.py start_scheduler
```

Output sẽ hiển thị:
```
✅ Scheduler started! Sẽ gửi reminder lúc 7:00 sáng mỗi ngày (Giờ Việt Nam)
```

---

## 🧪 Test Immediately

### **Test #1: Manual command**
```bash
python manage.py send_daily_reminders
```

Kỳ vọng output:
```
Đang quét Flashcard tồn đọng tính đến ngày 2025-12-22...
✅ Đã gửi nhắc nhở cho X người dùng.
```

### **Test #2: Check Database**
```bash
python manage.py shell
>>> from api.models.notification import Notification
>>> Notification.objects.filter(description__contains='ôn tập').count()
5  # (hoặc số lượng user có flashcard tồn đọng)
```

### **Test #3: Check Email**
Kiểm tra hộp thư của user (nếu count >= 5):
- Email từ: `noreply@pocketlingo.com`
- Subject: `PocketLingo: Đừng để quên kiến thức!`
- Content: Danh sách flashcard cần ôn tập

---

## ✅ Frontend Check

Frontend logic đã được update: [UserNotificationDropdown.tsx](../frontend/src/component/Header/UserNotificationDropdown.tsx)

**Khi user click notification:**
```
"Bạn có 5 từ cần ôn tập" 
   ↓ (Click)
Kiểm tra content chứa "ôn tập"? 
   ↓ Yes
Navigate /daily-review ✅
```

---

## 📌 Cách chạy ở Production

### **Option 1: Linux Cron (Khuyến khích)**
```bash
crontab -e
```
Thêm:
```cron
0 7 * * * cd /path/to/backend && /path/to/venv/bin/python manage.py send_daily_reminders >> /var/log/pocketlingo-reminder.log 2>&1
```

### **Option 2: Windows Task Scheduler**
1. Mở Task Scheduler
2. Create Basic Task
3. Set action: `C:\path\to\python.exe manage.py send_daily_reminders`
4. Trigger: Daily at 7:00 AM

### **Option 3: Keep Scheduler Running (Server)**
Thêm supervisor config:
```ini
[program:pocketlingo-scheduler]
command=/path/to/venv/bin/python /path/to/backend/manage.py start_scheduler
directory=/path/to/backend
autostart=true
autorestart=true
stderr_logfile=/var/log/pocketlingo-scheduler.err.log
stdout_logfile=/var/log/pocketlingo-scheduler.out.log
```

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: No module named 'django_apscheduler'` | `pip install django-apscheduler` |
| Email not sending | Check `.env` EMAIL_HOST_PASSWORD (use Gmail App Password) |
| Scheduler không chạy | Kiểm tra process: `ps aux \| grep start_scheduler` |
| Notification không hiển thị | Kiểm tra: `python manage.py send_daily_reminders` chạy được không? |
| User không chuyển sang `/daily-review` | Check browser console, kiểm tra notification description có chứa "ôn tập"? |

---

## 📊 Monitoring

```bash
# Check log realtime (Linux)
tail -f /var/log/pocketlingo-reminder.log

# Count notification sent today
python manage.py shell
>>> from datetime import datetime
>>> from api.models.notification import Notification
>>> Notification.objects.filter(
...     created_at__date=datetime.now().date(),
...     description__contains='ôn tập'
... ).count()
```

---

## ✨ Checklist

- [ ] APScheduler installed
- [ ] `django_apscheduler` in INSTALLED_APPS
- [ ] .env có EMAIL config
- [ ] TIME_ZONE = 'Asia/Ho_Chi_Minh' 
- [ ] `send_daily_reminders.py` test successful
- [ ] Frontend click notification → chuyển `/daily-review`
- [ ] Email test successful
- [ ] Cron/Scheduler running in production

---

**Done!** 🎉 System is ready to send daily reminders!
