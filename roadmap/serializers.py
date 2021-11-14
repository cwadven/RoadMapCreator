from rest_framework import serializers

from roadmap.models import RoadMap, BaseNode, BaseNodeDegree


class BaseNodeDegreeDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseNodeDegree
        fields = [
            "id",
            "to_basenode_id",
            "weight"
        ]


class BaseNodeDetailSerializer(serializers.ModelSerializer):
    degree_set = BaseNodeDegreeDetailSerializer(source="degree_from", read_only=True, many=True)

    class Meta:
        model = BaseNode
        fields = [
            "id",
            "name",
            "description",
            "difficulty",
            "display_level",
            "hex_color_code",
            "active_count",
            "image",
            "created_at",
            "updated_at",
            "degree_set",
        ]


class RoadMapListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="account.username")

    class Meta:
        model = RoadMap
        fields = [
            "id",
            "username",
            "title",
            "description",
            "image",
            "created_at",
        ]


class RoadMapDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="account.username")
    basenode_set = BaseNodeDetailSerializer(many=True)

    class Meta:
        model = RoadMap
        fields = [
            "id",
            "username",
            "title",
            "description",
            "image",
            "created_at",
            "basenode_set",
        ]


