from rest_framework.pagination import PageNumberPagination


class DefaultPagination(PageNumberPagination):
    """Page-number pagination with a hard ceiling.

    Applied per-view (not globally) so existing array-returning endpoints keep
    their current response shape. New endpoints opt in via ``pagination_class``.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 200
