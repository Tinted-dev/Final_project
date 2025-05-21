# backend/app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
import logging
import traceback

from ..models import User, Company, Region, Service, db

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Registers a new standard user.
    """
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    try:
        new_user = User(username=username, email=email, role='user') # Default role 'user'
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=str(new_user.id))
        logger.info(f"User '{new_user.username}' registered successfully.")
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'role': new_user.role
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.exception("Error during user registration:")
        return jsonify({'error': 'Internal server error during registration'}), 500

@auth_bp.route('/register-company', methods=['POST'])
def register_company():
    """
    Registers a new company and its associated company_owner user.
    """
    data = request.get_json()
    
    # User credentials
    username = data.get('username')
    password = data.get('password')
    user_email = data.get('user_email') # Email for the user account

    # Company details
    company_name = data.get('name')
    company_email = data.get('email') # Email for the company
    company_phone = data.get('phone')
    company_description = data.get('description')
    company_region_id = data.get('region_id')
    company_service_ids = data.get('services', [])

    # Basic validation
    if not (username and password and user_email and company_name and company_email and company_phone):
        return jsonify({'error': 'All required fields (user credentials and company details) must be provided'}), 400

    # Check for existing username/email for the user account
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409
    if User.query.filter_by(email=user_email).first():
        return jsonify({'error': 'User email already exists'}), 409
    
    # Check for existing company name/email
    if Company.query.filter_by(name=company_name).first():
        return jsonify({'error': 'Company name already exists'}), 409
    if Company.query.filter_by(email=company_email).first():
        return jsonify({'error': 'Company email already exists'}), 409

    try:
        # 1. Create the User record for the company owner
        new_user = User(username=username, email=user_email, role='company_owner')
        new_user.set_password(password)
        db.session.add(new_user)

        # 2. Create the Company record
        region = None
        if company_region_id:
            region = Region.query.get(company_region_id)
            if not region:
                return jsonify({'error': 'Invalid region ID provided'}), 400

        valid_service_ids = [int(s_id) for s_id in company_service_ids if s_id is not None]
        services = Service.query.filter(Service.id.in_(valid_service_ids)).all() if valid_service_ids else []

        new_company = Company(
            name=company_name,
            email=company_email,
            phone=company_phone,
            description=company_description,
            status='pending', # Companies usually start as pending review
            region=region,
            user=new_user # Link to the user who created it (the company_owner)
        )
        new_company.services = services # Associate services
        db.session.add(new_company)
        
        # 3. Flush the session to get IDs for new_user and new_company
        db.session.flush() 

        # 4. Now that new_company has an ID, link new_user.company_id to new_company.id directly.
        new_user.company_id = new_company.id

        db.session.commit() # Commit the entire transaction

        access_token = create_access_token(identity=str(new_user.id))
        logger.info(f"Company '{new_company.name}' and owner '{new_user.username}' registered successfully.")
        return jsonify({
            'message': 'Company and owner registered successfully',
            'access_token': access_token,
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'role': new_user.role,
                'company_id': new_company.id
            }
        }), 201
    except IntegrityError as e:
        db.session.rollback()
        logger.exception("IntegrityError during company registration:")
        return jsonify({'error': 'Registration failed due to existing data (e.g., company name/email, user username/email already exists).'}), 409
    except Exception as e:
        db.session.rollback()
        logger.exception("Error during company registration:")
        return jsonify({'error': 'Internal server error during company registration'}), 500


@auth_bp.route('/token', methods=['POST'])
def login():
    """
    Authenticates a user and returns JWT access token.
    """
    username = request.json.get('username', None)
    password = request.json.get('password', None)

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        logger.info(f"User '{user.username}' logged in successfully.")
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
        # If the user is a company owner, include their company_id
        if user.role == 'company_owner' and user.company_profile:
            user_data['company_id'] = user.company_profile.id
            logger.info(f"Company owner '{user.username}' logged in for company ID: {user.company_profile.id}")

        return jsonify({
            'access_token': access_token,
            'user': user_data
        }), 200
    else:
        logger.warning(f"Failed login attempt for username: {username}")
        return jsonify({'msg': 'Bad username or password'}), 401
