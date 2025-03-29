from django.db import models
from jsonfield import JSONField

class conversations(models.Model):
    identity = models.EmailField(unique=True, null=False, primary_key=True)
    topics = JSONField(default=dict)
    titles = JSONField(default=dict)
