
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary
import cloudinary.uploader

class UploadImageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'Không có file được cung cấp'}, status=400)

        try:
            upload_result = cloudinary.uploader.upload(file_obj)
            file_url = upload_result.get('secure_url')
            if not file_url:
                return Response({'error': 'Lỗi tải lên ảnh'}, status=500)
            return Response({'url': file_url})
        except Exception as e:
            return Response({'error': f'Lỗi tải lên ảnh: {str(e)}'}, status=500)

