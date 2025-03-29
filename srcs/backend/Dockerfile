FROM python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /work
RUN pip install --upgrade pip
RUN pip install django
RUN pip install django_rest_framework
RUN pip install bcrypt
RUN pip install dotenv
RUN pip install channels
RUN pip install daphne
RUN pip install requests
RUN pip install google-generativeai
RUN pip install jsonfield
RUN pip install twikit
COPY ./AI .
COPY ./run/run.sh .
RUN chmod +x run.sh
CMD ["./run.sh"]