from django.db.models import F, Prefetch
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common_library import mandatory_key, optional_key
from roadmap.models import RoadMap, BaseNode
from roadmap.serializers import RoadMapListSerializer, RoadMapDetailSerializer


class RoadMapAPI(APIView):
    def get(self, request):
        roadmap_set = RoadMap.objects.select_related(
            'account'
        ).all()
        return Response(
            data={"roadmap_set": RoadMapListSerializer(roadmap_set, many=True).data},
            status=status.HTTP_200_OK
        )

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


class RoadMapDetailAPI(APIView):
    def get(self, request, id):
        try:
            roadmap = RoadMap.objects.prefetch_related(
                Prefetch(
                    "basenode_set",
                    queryset=BaseNode.objects.prefetch_related("degree_from").all()
                ),
            ).annotate(
                username=F("account__username"),
            ).get(
                id=id
            )
        except RoadMap.DoesNotExist:
            return Response(data={"message": "no such roadmap"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(data={"roadmap": RoadMapDetailSerializer(roadmap).data}, status=status.HTTP_200_OK)