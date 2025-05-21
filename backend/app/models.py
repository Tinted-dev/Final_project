from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from sqlalchemy import UniqueConstraint, event # Import event for listener


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
    role = db.Column(db.String(20), nullable=False)  # "admin", "collector", "user", "company_owner"

    # NEW: Link to the Company this user might own/manage (nullable for non-company_owner users)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete='SET NULL'), nullable=True) # Removed unique=True here
    # Define a one-to-one relationship from User to Company for company_owner
    company_profile = db.relationship('Company', back_populates='login_user', foreign_keys=[company_id])


    # Existing relationship: Companies created by this user (e.g., admin creating companies)
    companies_created = db.relationship( # Renamed from 'companies' for clarity
        'Company',
        back_populates='user',
        lazy=True,
        foreign_keys='Company.user_id',
        cascade="all"
    )

    # NEW: Explicitly name the unique constraint for 'company_id'
    # A user can only be the login_user for one company
    __table_args__ = (UniqueConstraint('company_id', name='_user_company_id_uc'),) # <--- ADD THIS LINE

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username} (Role: {self.role})>"


class Company(db.Model):
    __tablename__ = 'companies'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(50), default='pending', nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Foreign Key to User who initially created the company (e.g., an admin)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    user = db.relationship('User', back_populates='companies_created', foreign_keys=[user_id])

    # NEW: One-to-one relationship with the User account that serves as this company's login
    login_user = db.relationship('User', back_populates='company_profile', uselist=False, foreign_keys='User.company_id')


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

# Listener to automatically set User.company_id when Company.login_user is assigned
@event.listens_for(Company.login_user, 'set')
def receive_set(target, value, oldvalue, initiator):
    if value:
        value.company_id = target.id
    elif oldvalue:
        oldvalue.company_id = None


class Region(db.Model):
    __tablename__ = 'regions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)

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
