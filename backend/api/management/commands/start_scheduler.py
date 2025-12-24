"""
APScheduler command để chạy send_daily_reminders tự động mỗi ngày
Sử dụng: python manage.py start_scheduler
"""

from django.core.management.base import BaseCommand
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management import call_command
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Khởi động APScheduler để chạy send_daily_reminders hàng ngày lúc 7:00 sáng'

    def handle(self, *args, **options):
        try:
            # Sử dụng BlockingScheduler thay vì DjangoScheduler
            scheduler = BlockingScheduler(timezone='Asia/Ho_Chi_Minh')

            # Chạy lúc 7:00 sáng mỗi ngày (giờ Việt Nam)
            scheduler.add_job(
                self.run_daily_reminders,
                trigger=CronTrigger(hour=7, minute=0, timezone='Asia/Ho_Chi_Minh'),
                id='send_daily_reminders',
                name='Send Daily Review Reminders',
                replace_existing=True
            )

            self.stdout.write(
                self.style.SUCCESS(
                    'Scheduler started! Se gui reminder luc 7:00 sang moi ngay (Gio Viet Nam)'
                )
            )

            # Start scheduler (blocking - will run forever)
            try:
                scheduler.start()
            except KeyboardInterrupt:
                scheduler.shutdown()
                self.stdout.write(self.style.WARNING('Scheduler stopped'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))
            logger.error(f"Scheduler error: {e}", exc_info=True)
        
    def run_daily_reminders(self):
        """Goi command send_daily_reminders"""
        try:
            call_command('send_daily_reminders')
            logger.info("Daily reminders sent successfully")
            print("Daily reminders sent successfully")
        except Exception as e:
            logger.error(f"Error sending daily reminders: {e}", exc_info=True)
            print(f"Error sending daily reminders: {e}")
