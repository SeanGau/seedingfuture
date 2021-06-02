import os
SQLALCHEMY_DATABASE_URI = 'postgresql://USERNAME:PASSWORD@localhost:5432/seedingfuture'
SQLALCHEMY_ENGINE_OPTIONS = {'encoding': 'utf-8', 'json_serializer': lambda obj: obj, 'echo': False}
SQLALCHEMY_TRACK_MODIFICATIONS = False