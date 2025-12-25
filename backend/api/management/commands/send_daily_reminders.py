from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Count, Q
from api.models.user import User
from api.models.notification import Notification
from api.utils.notification_realtime import send_user_notification
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


class Command(BaseCommand):
    help = 'Send daily review reminders to users with overdue flashcards'

    def _send(self):
        today = timezone.now().date()

        self.stdout.write(f"Scanning overdue flashcards as of {today}...")

        users_to_remind = User.objects.filter(
            status=User.Status.ACTIVE,
            email_notifications_enabled=True
        ).annotate(
            due_count=Count(
                'user_flashcards',
                filter=Q(user_flashcards__next_review_date__lte=today)
            )
        ).filter(due_count__gt=0)

        count_sent = 0

        for user in users_to_remind.iterator():
            count = user.due_count
            
            if count <= 50:
                msg_text = f"Bạn có {count} từ vựng cần ôn tập hôm nay."
                due_count_display = str(count)
            else:
                msg_text = f"Bạn có 50+ từ vựng đang chờ. Hãy ôn tập ngay để tránh quên nhé!"
                due_count_display = "50+"

            noti = Notification.objects.create(
                user=user,
                description=f"{msg_text} Bắt đầu ngay!",
                status=Notification.Status.UNREAD
            )
            
            try:
                send_user_notification(user.id, {
                    "id": noti.id,
                    "description": noti.description,
                    "created_at": str(noti.created_at),
                    "status": noti.status,
                    "type": "DAILY_REVIEW"
                })
            except Exception:
                pass

            if count >= 5:
                try:
                    # Render HTML email from template
                    html_message = render_to_string('reminder.html', {
                        'name': user.name,
                        'message': msg_text,
                        'due_count': count,
                        'due_count_display': due_count_display,
                        'frontend_url': settings.FRONTEND_URL
                    })
                    send_mail(
                        subject="PocketLingo: Đừng để quên kiến thức!",
                        message=f"Chào {user.name},\n\n{msg_text}\nTruy cập app để học ngay: {settings.FRONTEND_URL}",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[user.email],
                        fail_silently=True,
                        html_message=html_message,
                    )
                except Exception:
                    pass
            
            count_sent += 1

        self.stdout.write(self.style.SUCCESS(f"Đã gửi nhắc nhở cho {count_sent} người dùng."))

    def handle(self, *args, **kwargs):
        # Use Redis lock when available to avoid duplicate runs across multiple instances
        use_redis = getattr(__import__('django.conf').conf.settings, 'USE_REDIS', False)
        if use_redis:
            try:
                import redis
                from django.conf import settings
                r = redis.Redis(host=settings.REDIS_HOST, port=getattr(settings, 'REDIS_PORT', 6379), password=getattr(settings, 'REDIS_PASSWORD', None))
                lock = r.lock('send_daily_reminders_lock', timeout=3600)
                acquired = lock.acquire(blocking=False)
                if not acquired:
                    self.stdout.write("Another instance is running; exiting")
                    return
                try:
                    self._send()
                finally:
                    try:
                        lock.release()
                    except Exception:
                        pass
            except Exception as exc:
                self.stdout.write(f"Failed to use redis lock (will run anyway): {exc}")
                # fallback to single run
                self._send()
        else:
            self._send()
