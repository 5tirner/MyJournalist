from celery import shared_task
from django.core import mail
from django.conf import settings


@shared_task
def send_verification_email(code, email):
    mail.send_mail('New News Ai - ACTIVATION', f"Hello {email}\nYour Activation Code is: {code}\nBest Regards,\nNew News Ai team.",
                    settings.EMAIL_HOST_USER, [email])