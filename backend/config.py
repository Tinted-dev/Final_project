import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')

    # --- CHANGE THIS LINE ---
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql://garbage_app_db_user:4v9V892DME2PdFIy7xPvYVXxtOzjFcfi@dpg-d0nc4uumcj7s73dr2vr0-a/garbage_app_db'
    )
    # --- END CHANGE ---

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_TOKEN_LOCATION = ['headers', 'cookies']
    JWT_COOKIE_SECURE = False  # Set to True in production with HTTPS
    JWT_COOKIE_SAMESITE = 'Lax'
    JWT_ACCESS_COOKIE_PATH = '/'
    JWT_COOKIE_CSRF_PROTECT = False  # Optional depending on implementation