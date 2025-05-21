from app import create_app
from app.extensions import db
from app.models import User, Company, Region, Service, Location
import random
from werkzeug.security import generate_password_hash
from sqlalchemy.orm import configure_mappers # Good practice to import this

app = create_app()

# It's good practice to configure mappers after all models are defined
# to ensure relationships are properly set up.
with app.app_context():
    configure_mappers()


with app.app_context():
    # Drop all existing tables and recreate them
    # This ensures a clean slate with the latest schema, especially important
    # if you're not using Flask-Migrate.
    db.drop_all()
    db.create_all()

    print("--- Seeding Database ---")

    # 1. Add regions
    print("Adding regions...")
    region_names = ["Central", "Nairobi", "Coast", "Rift Valley", "Western"]
    regions = [Region(name=name) for name in region_names]
    db.session.add_all(regions)
    db.session.commit()  # Commit so regions have IDs
    print(f"Added {len(regions)} regions.")

    # 2. Add locations (sample locations per region)
    print("Adding locations...")
    locations = []
    for region in regions:
        loc_names = [f"{region.name} Location {i+1}" for i in range(3)]
        for loc_name in loc_names:
            loc = Location(name=loc_name, region=region)
            locations.append(loc)
    db.session.add_all(locations)
    db.session.commit() # Commit locations
    print(f"Added {len(locations)} locations.")

    # 3. Create users
    print("Creating users...")
    admin_user = User(username="admin", email="admin@example.com", role="admin")
    admin_user.set_password("admin123") # Set password using the method

    normal_user = User(username="user", email="user@example.com", role="collector")
    normal_user.set_password("user123") # Set password using the method

    db.session.add_all([admin_user, normal_user])
    db.session.commit()
    print("Added admin and collector users.")

    # 4. Create companies (companies need users and regions)
    print("Creating companies...")
    company_entries = []
    # Ensure each tuple here has 4 elements: (name, email, phone, description)
    company_data = [
        ("Green Collectors Inc.", "eco@green.com", "+254700000001", "A leading eco-friendly waste collection service dedicated to sustainability."),
        ("WastePro Solutions", "contact@wastepro.com", "+254700000002", "Your professional waste management partner for commercial and residential needs."),
        ("Clean Kenya Co.", "info@cleankenya.com", "+254700000003", "Keeping Kenya clean, one collection at a time, with focus on community."),
        ("EcoSmart Disposal", "support@ecosmart.com", "+254700000004", "Smart, innovative solutions for sustainable and efficient waste disposal."),
        ("TrashAway", "hello@trashaway.com", "+254700000005", "Making trash disappear efficiently and responsibly across urban areas."),
        ("BinMasters Ltd.", "contact@binmasters.com", "+254700000006", "Masters of waste bin management, offering rental and collection services."),
        ("Nature First Waste", "info@naturefirst.com", "+254700000007", "Prioritizing nature in waste disposal, emphasizing recycling and composting."),
        ("Urban Cleaners", "support@urbancleaners.com", "+254700000008", "Dedicated to cleaner urban environments through regular and scheduled clean-ups."),
        ("Rapid Waste", "hello@rapidwaste.com", "+254700000009", "Fast and reliable waste removal services for urgent and routine requirements."),
        ("GreenEarth Services", "contact@greenearth.com", "+254700000010", "Sustainable services for a greener earth, promoting circular economy principles."),
    ]

    # This line now correctly unpacks 4 values: name, email, phone, description
    for i, (name, email, phone, description) in enumerate(company_data):
        company = Company(
            name=name,
            email=email,
            phone=phone,
            description=description, # Now 'description' is correctly passed
            status=random.choice(['pending', 'approved']),
            user=normal_user if i % 2 else admin_user, # Assign users alternately
            region=random.choice(regions) # Assign a random region
        )
        company_entries.append(company)

    db.session.add_all(company_entries)
    db.session.commit() # Commit companies so they have IDs
    print(f"Added {len(company_entries)} companies.")


    # 5. Add services and associate them with companies
    print("Adding services and associating with companies...")
    master_service_names = ["Recycling", "Landfill", "Composting", "Electronic Waste", "Hazardous Waste"]

    # For each company, create and assign random services directly
    for company in company_entries:
        # Randomly decide how many services this company will get (1 to 3)
        num_services_to_assign = random.randint(1, min(3, len(master_service_names))) # Ensure it doesn't try to pick more than available

        # Select random service names from the master list
        assigned_service_names = random.sample(master_service_names, k=num_services_to_assign)

        # Create new Service objects for each company and assign them directly
        # This ensures 'company_id' is set on creation.
        for service_name in assigned_service_names:
            service = Service(
                name=service_name,
                description=f"{service_name} services for {company.name}",
                company=company # Direct assignment sets company_id via the relationship
            )
            db.session.add(service) # Add each new service to the session

    db.session.commit() # Commit all the newly created services
    print("Services added and associated with companies.")


    print("\n✅ Database seeded successfully!")
    print("👤 Admin Login -> Username: admin | Password: admin123")
    print("👤 User Login  -> Username: user  | Password: user123")
    print("\n📍 Available Regions and Locations:")
    for region in Region.query.all():
        print(f" - {region.name}")
        for loc in region.locations:
            print(f"    * {loc.name}")
    
    print("\n🏢 Sample Companies and their assigned regions/services:")
    # This loop now prints all companies to better observe service distribution and descriptions
    for company in Company.query.all():
        service_names_list = ", ".join([s.name for s in company.services]) if company.services else "No services"
        # Access company.description directly
        print(f" - {company.name} | Region: {company.region.name if company.region else 'N/A'} | Services: {service_names_list} | Description: {company.description if company.description else 'N/A'}")