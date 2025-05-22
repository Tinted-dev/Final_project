import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')

    # Fix "postgres://" to "postgresql://"
    raw_uri = os.environ.get(
        'DATABASE_URL',
        'postgresql://app_db_o7l5_user:PjRZAEH8x12CJn8iqzCEhv0OdybMR00H@dpg-d0ngf3euk2gs73bv11vg-a/app_db_o7l5'
    )
    if raw_uri.startswith("postgres://"):
        raw_uri = raw_uri.replace("postgres://", "postgresql://", 1)

    SQLALCHEMY_DATABASE_URI = raw_uri

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_TOKEN_LOCATION = ['headers', 'cookies']
    JWT_COOKIE_SECURE = False  # Set to True in production with HTTPS
    JWT_COOKIE_SAMESITE = 'Lax'
    JWT_ACCESS_COOKIE_PATH = '/'
    JWT_COOKIE_CSRF_PROTECT = False  # Optional depending on implementation
