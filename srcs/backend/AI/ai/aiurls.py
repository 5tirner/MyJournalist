from django.urls import path
from .aiserver import lastNews

aisocket = [
    path('livenews/', lastNews.as_asgi(), name="Live News")
]