# from flask import Blueprint, jsonify
# from app import db
# from app.models import User, Company, Region, Service, Location
# import random

# seed_bp = Blueprint('seed', __name__)

# @seed_bp.route('/seed')
# def seed_database():
#     try:
#         # Clear all
#         Service.query.delete()
#         Company.query.delete()
#         Location.query.delete()
#         Region.query.delete()
#         User.query.delete()
#         db.session.commit()

#         # Add Regions
#         regions_data = ["Nairobi", "Mombasa", "Kisumu", "Eldoret", "Nakuru"]
#         regions = []
#         for r_name in regions_data:
#             region = Region(name=r_name, description=f"Region of {r_name}")
#             db.session.add(region)
#             regions.append(region)
#         db.session.commit()

#         # Add Locations
#         locations = []
#         for region in regions:
#             for i in range(3):
#                 location = Location(name=f"{region.name} Location {i+1}", region=region)
#                 db.session.add(location)
#                 locations.append(location)
#         db.session.commit()

#         # Add Users
#         admin_user = User(username='admin', email='admin@example.com', role='admin')
#         admin_user.set_password('admin123')
#         collector_user = User(username='collector', email='collector@example.com', role='collector')
#         collector_user.set_password('collector123')
#         normal_user = User(username='user', email='user@example.com', role='user')
#         normal_user.set_password('user123')
#         db.session.add_all([admin_user, collector_user, normal_user])
#         db.session.commit()

#         # Add Companies
#         users = User.query.all()
#         companies = []
#         for i in range(1, 11):
#             company = Company(
#                 name=f"Company {i}",
#                 email=f"company{i}@example.com",
#                 phone=f"07{random.randint(10000000, 99999999)}",
#                 description=f"Company {i} description",
#                 status=random.choice(['pending', 'active', 'rejected']),
#                 region=random.choice(regions),
#                 user=random.choice(users)
#             )
#             db.session.add(company)
#             companies.append(company)
#         db.session.commit()

#         # Add Services
#         services_data = [
#             {"name": "Waste Collection", "desc": "Regular garbage pickup"},
#             {"name": "Recycling Services", "desc": "Recyclable collection"},
#             {"name": "Hazardous Waste Disposal", "desc": "Safe disposal"},
#             {"name": "Composting Services", "desc": "Composting organics"},
#             {"name": "Commercial Waste", "desc": "Waste for businesses"}
#         ]
#         services = []
#         for s in services_data:
#             service = Service(name=s["name"], description=s["desc"])
#             db.session.add(service)
#             services.append(service)
#         db.session.commit()

#         # Associate services with companies
#         for company in companies:
#             for s in random.sample(services, k=random.randint(1, 3)):
#                 company.services.append(s)
#         db.session.commit()

#         return jsonify(message="Database seeded successfully")
    
#     except Exception as e:
#         db.session.rollback()
#         return jsonify(error=str(e)), 500
