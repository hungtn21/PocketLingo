"""
APScheduler command để chạy send_daily_reminders tự động mỗi ngày
Sử dụng: python manage.py start_scheduler
"""

from django.core.management.base import BaseCommand
from django_apscheduler.schedulers import DjangoScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management import call_command
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Khởi động APScheduler để chạy send_daily_reminders hàng ngày lúc 7:00 sáng'

    def handle(self, *args, **options):
        try:
            scheduler = DjangoScheduler()
            
            # Chạy lúc 7:00 sáng mỗi ngày (giờ Việt Nam)
            scheduler.add_job(
                self.run_daily_reminders,
                trigger=CronTrigger(hour=7, minute=0),
                id='send_daily_reminders',
                name='Send Daily Review Reminders',
                replace_existing=True,
                timezone='Asia/Ho_Chi_Minh'
            )
            
            scheduler.start()
            self.stdout.write(
                self.style.SUCCESS(
                    '✅ Scheduler started! Sẽ gửi reminder lúc 7:00 sáng mỗi ngày (Giờ Việt Nam)'
                )
            )
            
            # Keep scheduler running
            try:
                import time
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                scheduler.shutdown()
                self.stdout.write(self.style.WARNING('⏹️  Scheduler stopped'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {e}'))
            logger.error(f"Scheduler error: {e}", exc_info=True)
        
    def run_daily_reminders(self):
        """Gọi command send_daily_reminders"""
        try:
            call_command('send_daily_reminders')
            self.stdout.write(self.style.SUCCESS('✅ Daily reminders sent successfully'))
            logger.info("✅ Daily reminders sent successfully")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error sending daily reminders: {e}'))
            logger.error(f"Error sending daily reminders: {e}", exc_info=True)
