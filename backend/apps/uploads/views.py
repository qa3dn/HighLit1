from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView


class UploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class UploadFileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file_obj = serializer.validated_data["file"]
        return Response(
            {
                "filename": file_obj.name,
                "size": file_obj.size,
                "content_type": getattr(file_obj, "content_type", "application/octet-stream"),
            },
            status=201,
        )
