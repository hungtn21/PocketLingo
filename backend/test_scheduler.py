"""
Quick test script to verify scheduler functionality
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime

def test_job():
    print(f"[{datetime.now()}] Test job executed successfully!")

scheduler = BlockingScheduler(timezone='Asia/Ho_Chi_Minh')

# Run every minute for testing
scheduler.add_job(
    test_job,
    trigger=CronTrigger(minute='*'),
    id='test_job',
    name='Test Job',
    replace_existing=True
)

print(f"[{datetime.now()}] Scheduler started! Job will run every minute.")
print("Press Ctrl+C to stop...")

try:
    scheduler.start()
except KeyboardInterrupt:
    print("\nScheduler stopped.")
