from django.contrib import admin

from roadmap.models import RoadMap, BaseNode, UserNode, BaseNodeDegree

admin.site.register(RoadMap)
admin.site.register(BaseNode)
admin.site.register(UserNode)
admin.site.register(BaseNodeDegree)

