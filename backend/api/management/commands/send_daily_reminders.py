from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Count, Q
from api.models.user import User
from api.models.notification import Notification
from api.utils.notification_realtime import send_user_notification
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = 'Send daily review reminders to users with overdue flashcards'

    def handle(self, *args, **kwargs):
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
            else:
                msg_text = f"Bạn có 50+ từ vựng đang chờ. Hãy ôn tập ngay để tránh quên nhé!"

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
                    send_mail(
                        subject="PocketLingo: Đừng để quên kiến thức!",
                        message=f"Chào {user.name},\n\n{msg_text}\nTruy cập app để học ngay: {settings.FRONTEND_URL}",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[user.email],
                        fail_silently=True,
                    )
                except Exception:
                    pass
            
            count_sent += 1

        self.stdout.write(self.style.SUCCESS(f"Đã gửi nhắc nhở cho {count_sent} người dùng."))
