from collections import deque

from django.db import transaction
from django.db.models import F, Prefetch, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from STATUS_MSG import MSG_UNAUTHORIZED, MSG_DIFFERENT_ROADMAP, MSG_NOT_CONNECTED
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
            basenode_degree_set = BaseNodeDegree.objects.select_related(
                'to_basenode__roadmap',
                'from_basenode__roadmap',
            ).filter(from_basenode__roadmap=roadmap)
        except RoadMap.DoesNotExist as e:
            return Response(data={"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        content = {
            "roadmap": RoadMapDetailSerializer(roadmap).data,
            "degree_set": basenode_degree_set.values()
        }

        return Response(data={"success": content}, status=status.HTTP_200_OK)

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


# BaseNodeDegree 관련
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


# 최적의 경로 구하기
class ShortestDirectionAPI(APIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get(self, request, id):
        start_basenode_id = int(mandatory_key(request, "start_basenode_id"))
        end_basenode_id = int(mandatory_key(request, "end_basenode_id"))

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

        roadmap_basenode_set = RoadMapDetailSerializer(roadmap).data["basenode_set"]

        # start_basenode_id 와 end_basenode_id 가 RoadMap 안에 없을 경우 예외처리
        roadmap_basenode_id_set = set(map(lambda basenode: basenode['id'], roadmap_basenode_set))
        if {start_basenode_id, end_basenode_id} - roadmap_basenode_id_set:
            return Response(data={"detail": MSG_DIFFERENT_ROADMAP}, status=status.HTTP_400_BAD_REQUEST)

        # start_basenode_id, end_basenode_id 연결여부 확인
        connected_node_set = self.connected_basenode_set(start_basenode_id, roadmap_basenode_set)

        if not (end_basenode_id in connected_node_set):
            return Response(data={"detail": MSG_NOT_CONNECTED}, status=status.HTTP_200_OK)

        # 값 가공
        pre_data = {roadmap_basenode["id"]: roadmap_basenode for roadmap_basenode in roadmap_basenode_set}

        for data in pre_data:
            pre_data[data]["distance"] = float("inf")
            pre_data[data]["predecessor"] = None
            pre_data[data]["complete"] = False

        # 다익스트라 준비
        next_node = pre_data[start_basenode_id]
        next_node["distance"] = 0

        while next_node:
            for edge in next_node["degree_set"]:
                if not pre_data[edge["to_basenode_id"]]["complete"]:
                    if pre_data[edge["to_basenode_id"]]["distance"] > next_node["distance"] + edge["weight"]:
                        pre_data[edge["to_basenode_id"]]["distance"] = next_node["distance"] + edge["weight"]
                        pre_data[edge["to_basenode_id"]]["predecessor"] = next_node

            next_node["complete"] = True

            not_completed_node_set = list(filter(lambda id: not pre_data[id]["complete"], connected_node_set))

            if not_completed_node_set:
                not_completed_node_set.sort(key=lambda id: pre_data[id]["distance"])
                next_node = pre_data[not_completed_node_set[0]]
            else:
                next_node = None

        # 완료 후, 백트레킹 하기
        destination_node = pre_data[end_basenode_id]["predecessor"]

        shortest_path = f'{pre_data[end_basenode_id]["id"]}'
        route = [pre_data[end_basenode_id]["id"]]

        while destination_node:
            route.append(destination_node["id"])
            shortest_path = f'{destination_node["id"]} - {shortest_path}'
            destination_node = destination_node["predecessor"]

        # 결과
        basenode_degree_filter_set = list(zip(route[1:], route))

        q = Q()
        for basenode_degree_filter in basenode_degree_filter_set:
            q = q | Q(from_basenode_id=basenode_degree_filter[0], to_basenode_id=basenode_degree_filter[1])

        basenode_degree_shortest_connection_set = BaseNodeDegree.objects.filter(q).values(
            "id",
            "weight"
        )

        return Response(data={
            "success": {
                "basenode_degree_shortest_connection_set": basenode_degree_shortest_connection_set,
                "path_direction": f'출발지 [{pre_data[start_basenode_id]["id"]}], 도착지 [{pre_data[end_basenode_id]["id"]}] {shortest_path}',
                "total_weight": pre_data[end_basenode_id]["distance"],
            }
        }, status=status.HTTP_200_OK)

    @staticmethod
    def connected_basenode_set(start_basenode_id, roadmap_basenode_set):
        pre_data = {roadmap_basenode["id"]: roadmap_basenode for roadmap_basenode in roadmap_basenode_set}

        queue = deque()
        completed_basenode = []
        connection_nodes = []

        queue.append(pre_data[start_basenode_id])
        completed_basenode.append(start_basenode_id)

        while queue:
            current_node = queue.popleft()

            for connection in current_node.get("degree_set"):
                if not connection.get("to_basenode_id") in completed_basenode:
                    queue.append(pre_data[connection["to_basenode_id"]])
                    completed_basenode.append(connection["to_basenode_id"])

            connection_nodes.append(current_node)

        return completed_basenode
