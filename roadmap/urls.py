from django.urls import path

from roadmap.views import RoadMapAPI, RoadMapDetailAPI, BaseNodeAPI, BaseNodeDetailAPI, BaseNodeDegreeAPI

urlpatterns = [
    path("", RoadMapAPI.as_view()),
    path("/<int:id>", RoadMapDetailAPI.as_view()),
    path("/<int:roadmap_id>/basenode", BaseNodeAPI.as_view()),
    path("/basenode/<int:basenode_id>", BaseNodeDetailAPI.as_view()),
    path("/basenode/degree", BaseNodeDegreeAPI.as_view()),
]
