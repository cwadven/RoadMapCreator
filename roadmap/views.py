from django.db.models import F
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from roadmap.models import RoadMap


class RoadMapAPI(APIView):
    def get(self, request):
        roadmap_set = RoadMap.objects.annotate(
            username=F("account__username")
        ).values(
            "id",
            "username",
            "title",
            "description",
            "image",
            "created_at",
            "updated_at",
        )
        return Response(data={"roadmap_set": roadmap_set}, status=status.HTTP_200_OK)

    def post(self, request):
        title = request.POST.get("title")
        description = request.POST.get("description")

        if not request.user.is_authenticated:
            return Response(data={"message": "login required"}, status=status.HTTP_400_BAD_REQUEST)

        roadmap = RoadMap.objects.create(
            title=title,
            description=description,
            account=request.user,
        )

        return Response(data={"success": roadmap.id}, status=status.HTTP_200_OK)
