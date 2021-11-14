from django.db.models import F
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common_library import mandatory_key, optional_key
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
        if not request.user.is_authenticated:
            return Response(data={"message": "login required"}, status=status.HTTP_400_BAD_REQUEST)

        title = mandatory_key(request, "title")
        description = optional_key(request, "description")
        image = request.FILES.get("image")

        roadmap = RoadMap.objects.create(
            title=title,
            description=description,
            account=request.user,
            image=image
        )

        return Response(data={"success": roadmap.id}, status=status.HTTP_200_OK)
