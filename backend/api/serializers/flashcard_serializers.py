from rest_framework import serializers
from api.models.flashcard import Flashcard
from api.models.user_flashcard import UserFlashcard
import cloudinary
import cloudinary.uploader
import cloudinary.api


class FlashcardSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Flashcard
        fields = ['id', 'lesson', 'word', 'meaning', 'example', 'image_url', 'image', 'created_at']
        read_only_fields = ['id', 'lesson', 'created_at']

    def create(self, validated_data):
        image = validated_data.pop('image', None)

        instance = super().create(validated_data)

        if image:
            upload = cloudinary.uploader.upload(image)
            instance.image_url = upload.get("secure_url")
            instance.save(update_fields=["image_url"])

        return instance

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)

        instance = super().update(instance, validated_data)

        if image:
            upload = cloudinary.uploader.upload(image)
            instance.image_url = upload.get("secure_url")
            instance.save(update_fields=["image_url"])

        return instance


class FlashcardDetailSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    user_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Flashcard
        fields = ['id', 'lesson', 'lesson_title', 'word', 'meaning', 'example', 'image_url', 'created_at', 'user_status']
        read_only_fields = ['id', 'created_at']
    
    def get_user_status(self, obj):
        """Lấy trạng thái học của user cho flashcard này"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        user_flashcard = UserFlashcard.objects.filter(
            user=request.user,
            flashcard=obj
        ).first()
        
        if not user_flashcard:
            return None
        
        return {
            'level': user_flashcard.level,
            'status': UserFlashcard.calculate_status(user_flashcard.level),
            'next_review_date': user_flashcard.next_review_date,
            'times_reviewed': user_flashcard.times_reviewed,
        }
