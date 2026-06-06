import os
import uuid

from django.conf import settings
from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

# Each allowed type maps to its canonical extension and the magic bytes a real
# file of that type must start with. We sniff the bytes ourselves instead of
# trusting the client-reported content type (which is adversarial). SVG stays
# permanently banned — it is an XSS vector (CLAUDE.md §3).
ALLOWED_TYPES = {
    "image/jpeg": {"ext": ".jpg", "magic": (b"\xff\xd8\xff",)},
    "image/png": {"ext": ".png", "magic": (b"\x89PNG\r\n\x1a\n",)},
    "image/webp": {"ext": ".webp", "magic": (b"RIFF",)},
    "image/gif": {"ext": ".gif", "magic": (b"GIF87a", b"GIF89a")},
    "application/pdf": {"ext": ".pdf", "magic": (b"%PDF-",)},
}
EXT_TO_TYPE = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".pdf": "application/pdf",
}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
INLINE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


class UploadSerializer(serializers.Serializer):
    file = serializers.FileField()


def _sniff_matches(head: bytes, content_type: str) -> bool:
    """A file is accepted only if its leading bytes match the declared type."""
    return any(head.startswith(sig) for sig in ALLOWED_TYPES[content_type]["magic"])


class UploadFileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file_obj = serializer.validated_data["file"]

        content_type = getattr(file_obj, "content_type", "application/octet-stream")
        if content_type not in ALLOWED_TYPES:
            return Response(
                {"detail": "يُسمح فقط بصور JPEG/PNG/WebP/GIF أو ملف PDF."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if file_obj.size > MAX_UPLOAD_BYTES:
            return Response(
                {"detail": "حجم الملف يجب ألا يتجاوز 5 ميغابايت."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Layer 2: magic-byte sniff. Read just the header, then rewind so the
        # full file is still written below.
        head = file_obj.read(16)
        file_obj.seek(0)
        if not _sniff_matches(head, content_type):
            return Response(
                {"detail": "محتوى الملف لا يطابق نوعه المعلن."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Layer 1: extension allowlist. Trust the sniffed type for the stored
        # extension rather than the original (possibly hostile) filename.
        ext = os.path.splitext(file_obj.name)[1].lower()
        if EXT_TO_TYPE.get(ext) != content_type:
            ext = ALLOWED_TYPES[content_type]["ext"]

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
                "inline": content_type in INLINE_TYPES,
            },
            status=status.HTTP_201_CREATED,
        )
