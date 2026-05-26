from django.urls import path

from .views import (
    AdminCompanyListView,
    AdminSubscriptionActivateView,
    AdminSubscriptionListView,
    AdminSubscriptionRejectView,
    CompanyAnalyticsView,
    CompanyApproveView,
    CompanyDetailView,
    CompanyFollowView,
    CompanyJobsView,
    CompanyListCreateView,
    CompanyMediaView,
    CompanyMemberDetailView,
    CompanyMembersView,
    CompanyPostCommentView,
    CompanyPostListCreateView,
    CompanyPostReactionView,
    CompanyRejectView,
    CompanySubscriptionView,
    CompanyVerifyView,
    MyCompaniesView,
    SubscriptionPlanListView,
)

urlpatterns = [
    path("", CompanyListCreateView.as_view()),
    path("mine", MyCompaniesView.as_view()),
    # Subscription/billing routes use static prefixes and must precede the
    # <slug> catch-all so they are not shadowed by it.
    path("plans", SubscriptionPlanListView.as_view()),
    path("subscriptions", AdminSubscriptionListView.as_view()),
    path("subscriptions/<int:pk>/activate", AdminSubscriptionActivateView.as_view()),
    path("subscriptions/<int:pk>/reject", AdminSubscriptionRejectView.as_view()),
    # Admin company-approval queue.
    path("admin/list", AdminCompanyListView.as_view()),
    # Post-scoped routes use a numeric id and are declared before the slug
    # catch-all so they are not shadowed by <slug>.
    path("posts/<int:post_id>/reactions", CompanyPostReactionView.as_view()),
    path("posts/<int:post_id>/comments", CompanyPostCommentView.as_view()),
    path("<slug:slug>", CompanyDetailView.as_view()),
    path("<slug:slug>/subscription", CompanySubscriptionView.as_view()),
    path("<slug:slug>/follow", CompanyFollowView.as_view()),
    path("<slug:slug>/members", CompanyMembersView.as_view()),
    path("<slug:slug>/members/<int:member_id>", CompanyMemberDetailView.as_view()),
    path("<slug:slug>/posts", CompanyPostListCreateView.as_view()),
    path("<slug:slug>/media", CompanyMediaView.as_view()),
    path("<slug:slug>/jobs", CompanyJobsView.as_view()),
    path("<slug:slug>/analytics", CompanyAnalyticsView.as_view()),
    path("<slug:slug>/verify", CompanyVerifyView.as_view()),
    path("<slug:slug>/approve", CompanyApproveView.as_view()),
    path("<slug:slug>/reject", CompanyRejectView.as_view()),
]
