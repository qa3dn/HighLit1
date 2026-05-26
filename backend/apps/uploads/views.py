import os
import uuid

from django.conf import settings
from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024


class UploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class UploadFileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file_obj = serializer.validated_data["file"]

        content_type = getattr(file_obj, "content_type", "application/octet-stream")
        if content_type not in ALLOWED_CONTENT_TYPES:
            return Response(
                {"detail": "Only JPEG, PNG, WebP, and GIF images are allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if file_obj.size > MAX_UPLOAD_BYTES:
            return Response(
                {"detail": "File size must not exceed 5MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ext = os.path.splitext(file_obj.name)[1].lower() or ".jpg"
        if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
            ext_map = {
                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/webp": ".webp",
                "image/gif": ".gif",
            }
            ext = ext_map.get(content_type, ".jpg")

        upload_dir = settings.MEDIA_ROOT / "projects"
        upload_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{uuid.uuid4().hex}{ext}"
        destination = upload_dir / filename

        with open(destination, "wb+") as dest:
            for chunk in file_obj.chunks():
                dest.write(chunk)

        url = request.build_absolute_uri(f"{settings.MEDIA_URL}projects/{filename}")

        return Response(
            {
                "url": url,
                "filename": filename,
                "content_type": content_type,
                "size": file_obj.size,
            },
            status=status.HTTP_201_CREATED,
        )
