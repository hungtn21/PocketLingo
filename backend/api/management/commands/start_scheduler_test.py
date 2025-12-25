"""
APScheduler TEST MODE - chay moi phut de test
CHI DUNG DE TEST - KHONG DUNG CHO PRODUCTION
Su dung: python manage.py start_scheduler_test
"""

from django.core.management.base import BaseCommand
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management import call_command
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'TEST MODE: Chay send_daily_reminders moi phut de test'

    def handle(self, *args, **options):
        try:
            scheduler = BlockingScheduler(timezone='Asia/Ho_Chi_Minh')

            # CRON: Chay moi phut (cho test)
            scheduler.add_job(
                self.run_daily_reminders,
                trigger=CronTrigger(minute='*', timezone='Asia/Ho_Chi_Minh'),  # Moi phut
                id='send_daily_reminders_test',
                name='Send Daily Review Reminders (TEST)',
                replace_existing=True
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'[TEST MODE] Scheduler started at {datetime.now()}'
                )
            )
            self.stdout.write(
                self.style.WARNING(
                    'Will send reminders EVERY MINUTE for testing!'
                )
            )
            self.stdout.write(
                self.style.WARNING(
                    'Press Ctrl+C to stop...'
                )
            )

            # Start scheduler
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
            print(f"\n[{datetime.now()}] Running send_daily_reminders...")
            call_command('send_daily_reminders')
            logger.info("Daily reminders sent successfully")
            print(f"[{datetime.now()}] Daily reminders sent successfully!\n")
        except Exception as e:
            logger.error(f"Error sending daily reminders: {e}", exc_info=True)
            print(f"[{datetime.now()}] Error: {e}\n")
