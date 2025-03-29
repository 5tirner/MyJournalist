#!/bin/bash

echo "Backend Start..."

python manage.py makemigrations
python manage.py migrate
redis-server --daemonize yes
python manage.py runserver 0.0.0.0:9999 & celery -A newNews worker -l info

echo "Backend Done."