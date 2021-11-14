from django.urls import path

from roadmap.views import RoadMapAPI, RoadMapDetailAPI

urlpatterns = [
    path("", RoadMapAPI.as_view()),
    path("/<int:id>", RoadMapDetailAPI.as_view()),
]
