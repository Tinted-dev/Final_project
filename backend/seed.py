from app import create_app, db
from app.models import User, Company, Region, Service, Location # Ensure all models are imported
from werkzeug.security import generate_password_hash
import random
from sqlalchemy.orm import configure_mappers

# Ensure mappers are configured before accessing relationships
configure_mappers()

app = create_app()
app.app_context().push()

def seed_database():
    print("--- Seeding Database ---")

    # Clear existing data (optional, but good for fresh seeds)
    db.drop_all()
    db.create_all()

    # Add Regions
    print("Adding regions...")
    regions_data = ["Nairobi", "Mombasa", "Kisumu", "Eldoret", "Nakuru"]
    regions = []
    for r_name in regions_data:
        region = Region(name=r_name, description=f"Region of {r_name}")
        db.session.add(region)
        regions.append(region)
    db.session.commit()
    print(f"Added {len(regions)} regions.")

    # Add Locations and associate with Regions
    print("Adding locations...")
    locations = []
    for region in regions:
        loc_names = [f"{region.name} Location {i+1}" for i in range(3)]
        for loc_name in loc_names:
            location = Location(name=loc_name, region=region) # Associate location with region
            db.session.add(location)
            locations.append(location)
    db.session.commit()
    print(f"Added {len(locations)} locations.")

    # Create Users
    print("Creating users...")
    admin_user = User(username='admin', email='admin@example.com', role='admin')
    admin_user.set_password('admin123')
    db.session.add(admin_user)

    collector_user = User(username='collector', email='collector@example.com', role='collector')
    collector_user.set_password('collector123')
    db.session.add(collector_user)

    normal_user = User(username='user', email='user@example.com', role='user')
    normal_user.set_password('user123')
    db.session.add(normal_user)

    db.session.commit()
    print("Added admin, collector and normal users.")

    # Create Companies
    print("Creating companies...")
    companies = []
    users = User.query.all() # Get all users for assignment
    for i in range(1, 11): # Create 10 companies
        company = Company(
            name=f"Company {i}",
            email=f"company{i}@example.com",
            phone=f"07{random.randint(10000000, 99999999)}",
            description=f"Description for Company {i}",
            status=random.choice(['pending', 'active', 'rejected']),
            region=random.choice(regions), # Assign a random region
            user=random.choice(users) # Assign a random user as owner
        )
        db.session.add(company)
        companies.append(company)
    db.session.commit()
    print(f"Added {len(companies)} companies.")

    # -----------------------------------------------------------------------------
    # CHANGED: Adding services and associating with companies (Many-to-Many)
    # -----------------------------------------------------------------------------
    print("Adding services and associating with companies...")
    services_data = [
        {"name": "Waste Collection", "desc": "Regular garbage pickup"},
        {"name": "Recycling Services", "desc": "Collection and processing of recyclables"},
        {"name": "Hazardous Waste Disposal", "desc": "Safe disposal of hazardous materials"},
        {"name": "Composting Services", "desc": "Organic waste composting"},
        {"name": "Commercial Waste Management", "desc": "Tailored solutions for businesses"}
    ]

    all_services = []
    for s_data in services_data:
        service = Service(
            name=s_data["name"],
            description=s_data["desc"]
        )
        db.session.add(service)
        all_services.append(service)
    db.session.commit() # Commit services first so they have IDs

    # Now, associate services with companies
    for company in companies:
        # Each company gets 1 to 3 random services
        num_services = random.randint(1, 3)
        selected_services = random.sample(all_services, num_services)
        for service in selected_services:
            company.services.append(service) # <--- Correct way to associate in M2M
            # You can also do service.companies.append(company) - it's symmetrical

    db.session.commit() # Commit the associations
    print(f"Added {len(all_services)} services and associated them with companies.")
    # -----------------------------------------------------------------------------

    print("--- Database Seeding Complete ---")

if __name__ == '__main__':
    seed_database()