from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from ..models.user import User
import cloudinary
import cloudinary.uploader
import cloudinary.api

class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['name', 'email', 'avatar_url', 'avatar']

    def update(self, instance, validated_data):
        avatar = validated_data.pop('avatar', None)

        # Nếu user upload avatar mới thì lưu lên Cloudinary
        if avatar:
            upload = cloudinary.uploader.upload(avatar)
            instance.avatar_url = upload.get("secure_url")

        return super().update(instance, validated_data)

        