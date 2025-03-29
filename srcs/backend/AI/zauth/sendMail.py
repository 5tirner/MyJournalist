import smtplib, datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from django.conf import settings


def sendCodeVerefication(email, code):
    try:
        # print(f'{type(zestoreMail)} =>{zestoreMail}')
        message = MIMEMultipart()
        message['From'] = settings.EMAIL_HOST_USER
        message['To'] = email
        message['Subject'] = 'JournalistAI - Verification Code'
        content = f"Hello {email}\nYour Activation Code is: {code}\nBest Regards,\nJounalistAI's team."
        # message['X-Expiration-Date'] = expiration_date
        # mail.send_mail('New News Ai - ACTIVATION', f"Hello {serial.validated_data['email']}\nYour Activation Code is: {code}\nBest Regards,\nNew News Ai team.",
        #                    settings.EMAIL_HOST_USER, [serial.validated_data['email']])
        message.attach(MIMEText(content, 'plain'))
        server = smtplib.SMTP('smtp.gmail.com', 25)
        server.connect('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        toSend = message.as_string()
        server.sendmail(settings.EMAIL_HOST_USER, email, toSend)
        server.quit()
    except Exception as e:
        print(f"ERROR: {e}")