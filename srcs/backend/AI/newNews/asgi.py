"""
ASGI config for newNews project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import URLRouter, ProtocolTypeRouter
from ai.aiurls import aisocket
from .wsMiddleWare import wsAuth

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newNews.settings')

application = ProtocolTypeRouter(
    {
        'http': get_asgi_application(),
        'websocket': wsAuth(URLRouter(aisocket)),
    })
