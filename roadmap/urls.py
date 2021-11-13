from django.urls import path

from roadmap.views import RoadMapAPI

urlpatterns = [
    path("", RoadMapAPI.as_view()),
]
