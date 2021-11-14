from django.db import transaction
from django.db.models import F, Prefetch
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from STATUS_MSG import MSG_UNAUTHORIZED, MSG_DIFFERENT_ROADMAP
from common_library import mandatory_key, optional_key
from roadmap.models import RoadMap, BaseNode, BaseNodeDegree
from roadmap.serializers import RoadMapListSerializer, RoadMapDetailSerializer, BaseNodeDetailSerializer


# RoadMap 관련
class RoadMapAPI(APIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get(self, request):
        roadmap_set = RoadMap.objects.select_related(
            'account'
        ).all()
        return Response(
            data={"roadmap_set": RoadMapListSerializer(roadmap_set, many=True).data},
            status=status.HTTP_200_OK
        )

    def post(self, request):
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
    permission_classes = (IsAuthenticatedOrReadOnly,)

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
        except RoadMap.DoesNotExist as e:
            return Response(data={"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(data={"success": RoadMapDetailSerializer(roadmap).data}, status=status.HTTP_200_OK)

    def put(self, request, id):
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

            if request.user != roadmap.account:
                return Response(data={"detail": MSG_UNAUTHORIZED}, status=status.HTTP_401_UNAUTHORIZED)

            update_fields = ["updated_at"]

            with transaction.atomic():
                title = optional_key(request, "title")
                description = optional_key(request, "description")
                image = request.FILES.get("image")

                if title:
                    roadmap.title = title
                    update_fields.append("title")
                if description:
                    roadmap.description = description
                    update_fields.append("description")
                if image:
                    roadmap.image = image
                    update_fields.append("image")

                roadmap.save(update_fields=update_fields)

            return Response(data={"success": RoadMapDetailSerializer(roadmap).data}, status=status.HTTP_200_OK)

        except RoadMap.DoesNotExist as e:
            return Response(data={"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# BaseNode 관련
class BaseNodeAPI(APIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def post(self, request, roadmap_id):
        try:
            roadmap = RoadMap.objects.get(id=roadmap_id)
        except RoadMap.DoesNot as e:
            return Response(data={"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if roadmap.account != request.user:
            return Response(data={"detail": MSG_UNAUTHORIZED}, status=status.HTTP_401_UNAUTHORIZED)

        name = mandatory_key(request, "name")
        description = optional_key(request, "description")
        difficulty = mandatory_key(request, "difficulty")
        display_level = mandatory_key(request, "display_level")
        hex_color_code = optional_key(request, "hex_color_code")
        image = request.FILES.get("image")

        with transaction.atomic():
            basenode = BaseNode.objects.create(
                account=request.user,
                roadmap=roadmap,
                name=name,
                description=description,
                difficulty=int(difficulty),
                display_level=int(display_level),
                hex_color_code=hex_color_code,
                image=image,
            )

        return Response(data={"success": BaseNodeDetailSerializer(basenode).data}, status=status.HTTP_200_OK)


class BaseNodeDetailAPI(APIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def put(self, request, basenode_id):
        try:
            basenode = BaseNode.objects.get(id=basenode_id)
        except BaseNode.DoesNotExist as e:
            return Response(data={"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if basenode.account != request.user:
            return Response(data={"detail": MSG_UNAUTHORIZED}, status=status.HTTP_401_UNAUTHORIZED)

        update_fields = ["updated_at"]

        # 수정하기
        name = optional_key(request, "name")
        description = optional_key(request, "description")
        difficulty = optional_key(request, "difficulty")
        display_level = optional_key(request, "display_level")
        hex_color_code = optional_key(request, "hex_color_code")
        image = request.FILES.get("image")

        with transaction.atomic():
            if name:
                basenode.name = name
                update_fields.append("name")
            if description:
                basenode.description = description
                update_fields.append("description")
            if difficulty:
                basenode.difficulty = int(difficulty)
                update_fields.append("difficulty")
            if display_level:
                basenode.display_level = int(display_level)
                update_fields.append("display_level")
            if hex_color_code:
                basenode.hex_color_code = hex_color_code
                update_fields.append("hex_color_code")
            if image:
                basenode.image = image
                update_fields.append("image")

            basenode.save(update_fields=update_fields)

        return Response(data={"success": BaseNodeDetailSerializer(basenode).data}, status=status.HTTP_200_OK)


class BaseNodeDegreeAPI(APIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def post(self, request):
        from_basenode_id = mandatory_key(request, "from_basenode_id")
        to_basenode_id = mandatory_key(request, "to_basenode_id")
        weight = mandatory_key(request, "weight")

        try:
            from_basenode = BaseNode.objects.get(id=from_basenode_id)
            to_basenode = BaseNode.objects.get(id=to_basenode_id)
        except BaseNode.DoesNotExist as e:
            return Response(data={"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if from_basenode.account != request.user and to_basenode.account != request.user:
            return Response(data={"detail": MSG_UNAUTHORIZED}, status=status.HTTP_401_UNAUTHORIZED)

        if from_basenode.roadmap != to_basenode.roadmap:
            return Response(data={"detail": MSG_DIFFERENT_ROADMAP}, status=status.HTTP_400_BAD_REQUEST)

        try:
            basenode_degree = BaseNodeDegree.objects.update_or_create(
                from_basenode=from_basenode,
                to_basenode=to_basenode,
                defaults={"weight": weight}
            )
        except Exception as e:
            return Response(data={"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(data={"success": BaseNodeDetailSerializer(from_basenode).data}, status=status.HTTP_200_OK)

    def delete(self, request):
        from_basenode_id = mandatory_key(request, "from_basenode_id")
        to_basenode_id = mandatory_key(request, "to_basenode_id")

        try:
            from_basenode = BaseNode.objects.get(id=from_basenode_id)
            to_basenode = BaseNode.objects.get(id=to_basenode_id)
        except BaseNode.DoesNotExist as e:
            return Response(data={"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if from_basenode.account != request.user and to_basenode.account != request.user:
            return Response(data={"detail": MSG_UNAUTHORIZED}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            basenode_degree = BaseNodeDegree.objects.get(
                from_basenode=from_basenode,
                to_basenode=to_basenode,
            )
            basenode_degree.delete()
        except Exception as e:
            return Response(data={"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(data={"success": BaseNodeDetailSerializer(from_basenode).data}, status=status.HTTP_200_OK)