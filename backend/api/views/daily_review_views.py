# api/views/daily_review_views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from api.models.user_flashcard import UserFlashcard


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_review_summary(request):
    """
    Lấy tổng quan ôn tập hàng ngày.
    Hiển thị ở trang chủ.
    """
    user = request.user
    summary = UserFlashcard.get_review_summary(user)
    
    return Response({
        'success': True,
        'data': summary
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_review_session(request):
    """
    Lấy flashcard cần ôn tập hôm nay.
    Gộp từ TẤT CẢ các bài học.
    """
    user = request.user
    
    # 1. Get all due cards
    due_cards = UserFlashcard.get_cards_due_for_review(user)
    
    if not due_cards.exists():
        return Response({
            'success': True,
            'data': {
                'total': 0,
                'flashcards': [],
                'message': 'Không có từ nào cần ôn tập hôm nay. Tuyệt vời!'
            }
        })
    
    # 2. Format response
    flashcards_data = [
        {
            'id': uf.flashcard.id,
            'user_flashcard_id': uf.id,
            'word': uf.flashcard.word,
            'meaning': uf.flashcard.meaning,
            'example': uf.flashcard.example,
            'image_url': uf.flashcard.image_url,
            'level': uf.level,
            'lesson': {
                'id': uf.flashcard.lesson.id,
                'title': uf.flashcard.lesson.title,
            }
        }
        for uf in due_cards
    ]
    
    return Response({
        'success': True,
        'data': {
            'mode': 'daily_review',
            'total': len(flashcards_data),
            'flashcards': flashcards_data,
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_daily_review_results(request):
    """
    Ghi nhận kết quả ôn tập hàng ngày.
    Cập nhật level và next_review_date.
    
    Body: {
        "results": [
            {"user_flashcard_id": 1, "remembered": true},
            {"user_flashcard_id": 2, "remembered": false},
            ...
        ]
    }
    """
    user = request.user
    results = request.data.get('results', [])
    
    if not results:
        return Response({
            'success': False,
            'error': 'Không có kết quả để ghi nhận.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Process results
    remembered_count = 0
    not_remembered_count = 0
    processed = []
    
    for item in results:
        uf_id = item.get('user_flashcard_id')
        remembered = item.get('remembered', False)
        
        try:
            user_flashcard = UserFlashcard.objects.get(id=uf_id, user=user)
            
            if remembered:
                user_flashcard.mark_remembered()
                remembered_count += 1
            else:
                user_flashcard.mark_not_remembered()
                not_remembered_count += 1
            
            processed.append({
                'user_flashcard_id': uf_id,
                'new_level': user_flashcard.level,
                'next_review_date': user_flashcard.next_review_date,
            })
            
        except UserFlashcard.DoesNotExist:
            continue
    
    # Award XP
    xp_gained = 50 if remembered_count > 0 else 20
    user.xp = (user.xp or 0) + xp_gained
    user.save()
    
    # Update streak (optional - nếu có)
    # update_user_streak(user)
    
    return Response({
        'success': True,
        'data': {
            'remembered_count': remembered_count,
            'not_remembered_count': not_remembered_count,
            'xp_gained': xp_gained,
            'total_xp': user.xp,
            'processed': processed,
            'message': f'Đã ôn tập {remembered_count + not_remembered_count} từ!'
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_review_count(request):
    """
    Lấy số từ cần ôn tập (cho badge/notification).
    Gọi nhanh, không cần chi tiết.
    """
    user = request.user
    count = UserFlashcard.get_cards_due_for_review(user).count()
    
    return Response({
        'success': True,
        'data': {
            'count': count
        }
    })