from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # "admin" or "collector"

    # IMPORTANT: Added ondelete='SET NULL' for companies.
    # If a User is deleted, their associated companies will have user_id set to NULL.
    # If you want companies to be deleted when user is deleted, change to ondelete='CASCADE'
    companies = db.relationship('Company', back_populates='user', lazy=True,
                                foreign_keys='Company.user_id',
                                cascade="all, delete-orphan") # cascade is needed for SQLAlchemy side if deleting the user

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Company(db.Model):
    __tablename__ = 'companies'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(50), default='pending')
    # IMPORTANT: Added ondelete='SET NULL' here, or 'CASCADE' if you want Company deleted when User is deleted.
    # The 'cascade' on the relationship in User model also plays a role.
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True) # Changed nullable to True if SET NULL
    # IMPORTANT: Added ondelete='SET NULL' for regions.
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id', ondelete='SET NULL'))
    description = db.Column(db.Text, nullable=True) # Use db.Text for longer descriptions
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # Added created_at field for consistency


    user = db.relationship('User', back_populates='companies')
    region = db.relationship('Region', back_populates='companies')
    # IMPORTANT: Added cascade="all, delete-orphan" for services
    # This ensures that when a Company is deleted via SQLAlchemy, its associated Services are also deleted.
    services = db.relationship('Service', back_populates='company', lazy=True, cascade="all, delete-orphan")


class Region(db.Model):
    __tablename__ = 'regions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)

    # If you delete a Region, you likely want to set company.region_id to NULL, not delete companies.
    # Handled by ondelete='SET NULL' in Company.region_id ForeignKey.
    companies = db.relationship('Company', back_populates='region', lazy=True)
    
    # IMPORTANT: Added cascade="all, delete-orphan" for locations
    # If a Region is deleted, its associated Locations should be deleted.
    locations = db.relationship('Location', back_populates='region', lazy=True, cascade="all, delete-orphan")


class Location(db.Model):
    __tablename__ = 'locations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # IMPORTANT: Added ondelete='CASCADE' for regions.
    # If a Region is deleted, its Locations are deleted.
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id', ondelete='CASCADE'), nullable=False)

    region = db.relationship('Region', back_populates='locations')


class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    # IMPORTANT: Added ondelete='CASCADE' for companies.
    # If a Company is deleted, its associated Services are deleted.
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete='CASCADE'), nullable=False)

    company = db.relationship('Company', back_populates='services')