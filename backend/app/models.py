from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from sqlalchemy import UniqueConstraint

# Association table for Many-to-Many Company-Service relationship
company_service_association = db.Table(
    'company_service_association',
    db.Column('company_id', db.Integer, db.ForeignKey('companies.id', ondelete='CASCADE'), primary_key=True),
    db.Column('service_id', db.Integer, db.ForeignKey('services.id', ondelete='CASCADE'), primary_key=True)
)


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # "admin" or "collector" or "user"

    companies = db.relationship(
        'Company',
        back_populates='user',
        lazy=True,
        foreign_keys='Company.user_id',
        cascade="all"
    )

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
    status = db.Column(db.String(50), default='pending', nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    user = db.relationship('User', back_populates='companies')

    region_id = db.Column(db.Integer, db.ForeignKey('regions.id', ondelete='SET NULL'), nullable=True)
    region = db.relationship('Region', back_populates='companies')

    services = db.relationship(
        'Service',
        secondary=company_service_association,
        back_populates='companies',
        lazy='dynamic',
        cascade="all"
    )

    __table_args__ = (UniqueConstraint('name', name='_company_name_uc'),)

    def __repr__(self):
        return f'<Company {self.name}>'


class Region(db.Model):
    __tablename__ = 'regions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True) # <--- ADDED THIS LINE

    companies = db.relationship('Company', back_populates='region', lazy=True)
    
    locations = db.relationship(
        'Location',
        back_populates='region',
        lazy=True,
        cascade="all, delete-orphan"
    )


class Location(db.Model):
    __tablename__ = 'locations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id', ondelete='CASCADE'), nullable=False)

    region = db.relationship('Region', back_populates='locations')


class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    
    companies = db.relationship(
        'Company',
        secondary=company_service_association,
        back_populates='services',
        lazy='dynamic'
    )

    __table_args__ = (UniqueConstraint('name', name='_service_name_uc'),)

    def __repr__(self):
        return f'<Service {self.name}>'