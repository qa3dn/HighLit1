from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Comment, Job, JobReview, Post, Reaction, Space
from .serializers import (
    CommentSerializer,
    JobReviewSerializer,
    JobSerializer,
    PostSerializer,
    SpaceSerializer,
    reaction_totals,
)


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Post.objects.all().order_by("-created_at")
        post_type = self.request.query_params.get("type")
        user_id = self.request.query_params.get("user_id")
        if post_type:
            queryset = queryset.filter(type=post_type)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]


class RantsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Post.objects.filter(type=Post.PostType.RANT).order_by("-created_at")


class TrendingView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Post.objects.annotate(reaction_count=Count("reactions")).order_by("-reaction_count", "-created_at")


class TagsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tags = {}
        for post in Post.objects.only("tags"):
            for tag in post.tags:
                tags[tag] = tags.get(tag, 0) + 1
        return Response([{"tag": k, "count": v} for k, v in sorted(tags.items(), key=lambda x: -x[1])])


class PostsByTagView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Post.objects.filter(tags__contains=[self.kwargs["tag"]]).order_by("-created_at")


class PostReactionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        Reaction.objects.get_or_create(post=post, user=request.user, type=request.data.get("type", "LIKE"))
        return Response({"ok": True})

    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        return Response(reaction_totals(post))


class PostCommentView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        queryset = post.comments.select_related("user").order_by("-created_at")
        return Response(CommentSerializer(queryset, many=True).data)

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(post=post, user=request.user)
        return Response(serializer.data, status=201)


class DailyStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_posts = Post.objects.count()
        total_comments = Comment.objects.count()
        total_reactions = Reaction.objects.count()
        return Response(
            {
                "total_posts": total_posts,
                "total_comments": total_comments,
                "total_reactions": total_reactions,
            }
        )


class StressView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"stress_level": "LOW", "score": 20})


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Job.objects.all().order_by("-created_at")
        location = self.request.query_params.get("location")
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class JobDetailView(generics.RetrieveAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]


class JobLocationsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        locations = list(Job.objects.exclude(location="").values_list("location", flat=True).distinct())
        return Response({"locations": locations})


class JobReviewView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        reviews = job.reviews.all().order_by("-created_at")
        return Response(JobReviewSerializer(reviews, many=True).data)

    def post(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        serializer = JobReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(job=job, user=request.user)
        return Response(serializer.data, status=201)


class SpaceListCreateView(generics.ListCreateAPIView):
    serializer_class = SpaceSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return Space.objects.all().order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(host=self.request.user)


class SpaceLiveView(generics.ListAPIView):
    serializer_class = SpaceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Space.objects.filter(is_live=True).order_by("-created_at")


class SpaceDetailView(generics.RetrieveAPIView):
    queryset = Space.objects.all()
    serializer_class = SpaceSerializer
    permission_classes = [permissions.AllowAny]


class SpaceStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        space = get_object_or_404(Space, pk=pk)
        if space.host_id != request.user.id:
            return Response({"detail": "Forbidden"}, status=403)
        space.is_live = True
        space.save(update_fields=["is_live"])
        return Response({"is_live": True})


class SpaceEndView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        space = get_object_or_404(Space, pk=pk)
        if space.host_id != request.user.id:
            return Response({"detail": "Forbidden"}, status=403)
        space.is_live = False
        space.save(update_fields=["is_live"])
        return Response({"is_live": False})
