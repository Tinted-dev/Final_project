from flask import Blueprint, jsonify
from app import db
from app.models import User, Company, Region, Service, Location
from werkzeug.security import generate_password_hash
import random
from sqlalchemy.orm import configure_mappers

seed_bp = Blueprint('seed', __name__)

@seed_bp.route('/seed', methods=['GET'])
def seed_database():
    configure_mappers()
    print("--- Seeding Database ---")
    
    db.drop_all()
    db.create_all()

    regions_data = ["Nairobi", "Mombasa", "Kisumu", "Eldoret", "Nakuru"]
    regions = []
    for r_name in regions_data:
        region = Region(name=r_name, description=f"Region of {r_name}")
        db.session.add(region)
        regions.append(region)
    db.session.commit()

    locations = []
    for region in regions:
        for i in range(3):
            location = Location(name=f"{region.name} Location {i+1}", region=region)
            db.session.add(location)
            locations.append(location)
    db.session.commit()

    admin_user = User(username='admin', email='admin@example.com', role='admin')
    admin_user.set_password('admin123')
    collector_user = User(username='collector', email='collector@example.com', role='collector')
    collector_user.set_password('collector123')
    normal_user = User(username='user', email='user@example.com', role='user')
    normal_user.set_password('user123')

    db.session.add_all([admin_user, collector_user, normal_user])
    db.session.commit()

    users = User.query.all()
    companies = []
    for i in range(1, 11):
        company = Company(
            name=f"Company {i}",
            email=f"company{i}@example.com",
            phone=f"07{random.randint(10000000, 99999999)}",
            description=f"Description for Company {i}",
            status=random.choice(['pending', 'active', 'rejected']),
            region=random.choice(regions),
            user=random.choice(users)
        )
        db.session.add(company)
        companies.append(company)
    db.session.commit()

    services_data = [
        {"name": "Waste Collection", "desc": "Regular garbage pickup"},
        {"name": "Recycling Services", "desc": "Collection and processing of recyclables"},
        {"name": "Hazardous Waste Disposal", "desc": "Safe disposal of hazardous materials"},
        {"name": "Composting Services", "desc": "Organic waste composting"},
        {"name": "Commercial Waste Management", "desc": "Tailored solutions for businesses"}
    ]
    services = []
    for s in services_data:
        service = Service(name=s["name"], description=s["desc"])
        db.session.add(service)
        services.append(service)
    db.session.commit()

    for company in companies:
        for service in random.sample(services, random.randint(1, 3)):
            company.services.append(service)
    db.session.commit()

    return jsonify({"message": "Database seeded successfully ✅"}), 200
