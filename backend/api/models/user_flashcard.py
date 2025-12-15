from django.db import models
from django.utils import timezone
from datetime import timedelta


class UserFlashcard(models.Model):
    """
    Lưu trạng thái học flashcard của user.
    
    Luồng hoạt động:
    1. Học lần đầu (trong bài học): Tạo record mới
    2. Ôn tập hàng ngày (trang chủ): Cập nhật level và next_review_date
    3. Luyện tập tự do (trong bài học): KHÔNG tạo/cập nhật record
    """
    
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='user_flashcards'
    )
    flashcard = models.ForeignKey(
        'Flashcard',
        on_delete=models.CASCADE,
        related_name='user_flashcards'
    )
    
    # Level: 0 = chưa nhớ, 1-7 = các cấp độ nhớ
    level = models.PositiveSmallIntegerField(default=0)
    
    # Ngày ôn tập tiếp theo
    next_review_date = models.DateField(null=True, blank=True)
    
    # Tracking
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    times_reviewed = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_flashcards'
        unique_together = ('user', 'flashcard')
        indexes = [
            models.Index(fields=['user', 'next_review_date']),
        ]
    
    # Spaced Repetition Config
    REVIEW_INTERVALS = {
        0: 0,    # Chưa nhớ → ôn ngay hôm nay
        1: 1,    # 1 ngày
        2: 3,    # 3 ngày
        3: 7,    # 7 ngày
        4: 14,   # 14 ngày
        5: 30,   # 30 ngày
        6: 60,   # 60 ngày
        7: 90,   # 90 ngày (max)
    }
    MAX_LEVEL = 7
    
    # ==================== INSTANCE METHODS ====================
    
    def mark_remembered(self):
        """Đánh dấu 'Đã nhớ' → tăng level, lùi ngày ôn."""
        self.level = min(self.level + 1, self.MAX_LEVEL)
        self.next_review_date = self._calculate_next_review_date()
        self.last_reviewed_at = timezone.now()
        self.times_reviewed += 1
        self.save()
        return self
    
    def mark_not_remembered(self):
        """Đánh dấu 'Chưa nhớ' → reset level 1, ôn sau 1 ngày."""
        self.level = 1
        self.next_review_date = timezone.now().date() + timedelta(days=1)
        self.last_reviewed_at = timezone.now()
        self.times_reviewed += 1
        self.save()
        return self
    
    def _calculate_next_review_date(self):
        interval = self.REVIEW_INTERVALS.get(self.level, 90)
        return timezone.now().date() + timedelta(days=interval)
    
    # ==================== CLASS METHODS ====================
    
    @classmethod
    def create_from_first_learn(cls, user, flashcard, remembered: bool):
        """Tạo record khi học lần đầu."""
        if remembered:
            level = 1
            next_review = timezone.now().date() + timedelta(days=1)
        else:
            level = 0
            next_review = timezone.now().date()
        
        instance, _ = cls.objects.update_or_create(
            user=user,
            flashcard=flashcard,
            defaults={
                'level': level,
                'next_review_date': next_review,
                'last_reviewed_at': timezone.now(),
                'times_reviewed': 1,
            }
        )
        return instance
    
    @classmethod
    def get_cards_due_for_review(cls, user, lesson=None):
        """Lấy flashcard cần ôn hôm nay."""
        today = timezone.now().date()
        queryset = cls.objects.filter(
            user=user,
            next_review_date__lte=today
        ).select_related('flashcard', 'flashcard__lesson')
        
        if lesson:
            queryset = queryset.filter(flashcard__lesson=lesson)
        
        return queryset.order_by('next_review_date', 'level')
    
    @classmethod
    def get_review_summary(cls, user):
        """Lấy tổng quan ôn tập cho trang chủ."""
        from django.db.models import Count
        
        today = timezone.now().date()
        due_cards = cls.objects.filter(
            user=user,
            next_review_date__lte=today
        ).select_related('flashcard__lesson')
        
        total = due_cards.count()
        
        by_lesson = due_cards.values(
            'flashcard__lesson_id',
            'flashcard__lesson__title'
        ).annotate(count=Count('id')).order_by('-count')
        
        return {
            'total': total,
            'by_lesson': [
                {
                    'lesson_id': item['flashcard__lesson_id'],
                    'lesson_title': item['flashcard__lesson__title'],
                    'count': item['count']
                }
                for item in by_lesson
            ]
        }
    
    @classmethod
    def get_unlearned_cards(cls, user, lesson):
        """Lấy flashcard chưa học trong lesson."""
        from api.models.flashcard import Flashcard
        
        learned_ids = cls.objects.filter(
            user=user,
            flashcard__lesson=lesson
        ).values_list('flashcard_id', flat=True)
        
        return Flashcard.objects.filter(
            lesson=lesson
        ).exclude(id__in=learned_ids).order_by('id')
    
    @classmethod
    def get_lesson_progress(cls, user, lesson):
        """Lấy tiến độ học trong lesson."""
        from api.models.flashcard import Flashcard
        
        total = Flashcard.objects.filter(lesson=lesson).count()
        user_cards = cls.objects.filter(user=user, flashcard__lesson=lesson)
        
        learned = user_cards.count()
        mastered = user_cards.filter(level__gte=5).count()
        
        today = timezone.now().date()
        due_today = user_cards.filter(next_review_date__lte=today).count()
        
        return {
            'total': total,
            'learned': learned,
            'mastered': mastered,
            'due_today': due_today,
            'progress_percent': round((learned / total) * 100) if total > 0 else 0,
        }
    
    # ==================== PROPERTIES ====================
    
    @property
    def is_due(self):
        if not self.next_review_date:
            return False
        return self.next_review_date <= timezone.now().date()
    
    def __str__(self):
        return f"{self.user} - {self.flashcard} (Lv.{self.level})"