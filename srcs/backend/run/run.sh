#!/bin/bash

echo "Backend Start..."

python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:9999

echo "Backend Done."