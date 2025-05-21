# backend/app/__init__.py
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from config import Config
from app.extensions import db

# Import your blueprints
from app.routes.auth import auth_bp
from app.routes.companies import companies_bp
from app.routes.services import services_bp
from app.routes.regions import regions_bp # <--- NEW IMPORT: Ensure this line is present

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    CORS(app)

    # Configure logging for development
    if app.debug:
        logging.basicConfig(level=logging.DEBUG,
                            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    else:
        logging.basicConfig(level=logging.INFO,
                            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(companies_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(regions_bp) # <--- NEW REGISTRATION: Ensure this line is present

    print(f"Blueprints registered: {app.blueprints.keys()}") # <--- ADDED FOR DEBUGGING: Confirm registration

    return app
