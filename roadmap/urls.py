from django.urls import path

from roadmap.views import RoadMapAPI, RoadMapDetailAPI, BaseNodeAPI

urlpatterns = [
    path("", RoadMapAPI.as_view()),
    path("/<int:id>", RoadMapDetailAPI.as_view()),
    path("/<int:roadmap_id>/basenode", BaseNodeAPI.as_view()),
]
