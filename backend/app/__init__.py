# app/__init__.py
from flask import Flask
from app.extensions import db, jwt, cors, migrate
from app.routes.auth import auth_bp
from app.routes.companies import companies_bp
from app.routes.regions import regions_bp
from app.routes.services import services_bp
from dotenv import load_dotenv
import logging

load_dotenv()
def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, supports_credentials=True)

    if app.debug: # app.debug is True if FLASK_ENV is 'development'
        logging.basicConfig(level=logging.DEBUG,
                            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


    # ✅ Import all models before initializing migrate
    from app.models import User, Company, Region, Service

    migrate.init_app(app, db)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(companies_bp, url_prefix='/api/companies')
    app.register_blueprint(regions_bp, url_prefix='/api/regions')
    app.register_blueprint(services_bp, url_prefix='/api/services')

    @app.route('/api/health')
    def health():
        return {'status': 'ok'}, 200

    return app
