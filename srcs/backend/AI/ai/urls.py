from django.urls import path
from .views import chatbot, get_convertation, getAllConversations

urlpatterns = [
    path('chat', chatbot, name="Chat with Journalist"),
    path('getConv', get_convertation, name="list conversation"),
    path('history', getAllConversations, name="Get The History")
]