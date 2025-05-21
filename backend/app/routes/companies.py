# backend/app/routes/companies.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
import traceback
import logging
from functools import wraps

from ..models import Company, Region, Service, User, db

logger = logging.getLogger(__name__)

# Custom decorator for role-based access control
def role_required(allowed_roles):
    """
    Decorator to restrict access to a route based on user roles.
    Requires @jwt_required() to be applied before this decorator.
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required() # Ensure JWT is required first
        def wrapper(*args, **kwargs):
            current_user_id_str = get_jwt_identity()
            try:
                current_user_id = int(current_user_id_str)
            except (ValueError, TypeError):
                logger.error(f"Invalid user ID in token: {current_user_id_str}")
                return jsonify({'msg': 'Invalid user identity in token'}), 401

            user = User.query.get(current_user_id)
            if not user:
                logger.error(f"User ID {current_user_id} from token not found in DB.")
                return jsonify({'msg': 'User not found'}), 404

            # Logging for debugging (keep for now, remove later)
            logger.info(f"Role Check: User '{user.username}' (ID: {user.id}) has role: '{user.role}'. Allowed roles: {allowed_roles}")

            if user.role not in allowed_roles:
                logger.warning(f"Access Denied: User '{user.username}' (role: {user.role}) attempted to access restricted resource. Allowed roles: {allowed_roles}")
                return jsonify({'msg': 'Access Denied: Insufficient permissions'}), 403 # Forbidden
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# Helper function to serialize a company for consistent JSON responses
def serialize_company(company):
    return {
        'id': company.id,
        'name': company.name,
        'email': company.email,
        'phone': company.phone,
        'description': company.description,
        'status': company.status,
        'user_id': company.user_id,
        'user_username': company.user.username if company.user else None,
        'region': {'id': company.region.id, 'name': company.region.name} if company.region else None,
        'services': [{'id': s.id, 'name': s.name, 'description': s.description} for s in company.services],
        'created_at': company.created_at.isoformat() if hasattr(company, 'created_at') and company.created_at else None
    }

companies_bp = Blueprint('companies', __name__, url_prefix='/api/companies')

# Get all companies (can be public or protected, depending on requirements)
@companies_bp.route('/', methods=['GET'])
# @jwt_required() # Uncomment this if only logged-in users can view companies
def get_companies():
    companies = Company.query.all()
    results = [serialize_company(c) for c in companies]
    return jsonify(results)

# Get company by id (can be public or protected)
@companies_bp.route('/<int:company_id>', methods=['GET'])
# @jwt_required() # Uncomment this if only logged-in users can view company details
def get_company(company_id):
    company = Company.query.get_or_404(company_id)
    return jsonify(serialize_company(company))

# Create a new company (protected by role)
@companies_bp.route('/', methods=['POST'])
@role_required(['admin']) # <--- CHANGED: Only admin can create companies
def create_company():
    current_user_id_str = get_jwt_identity()
    try:
        current_user_id = int(current_user_id_str)
    except (ValueError, TypeError):
        logger.error(f"Invalid user ID in token: {current_user_id_str}")
        return jsonify({'error': 'Invalid user identity in token'}), 401

    user = User.query.get(current_user_id)
    if not user:
        logger.error(f"Authenticated user ID {current_user_id} not found in database.")
        return jsonify({'error': 'Authenticated user not found'}), 404

    data = request.get_json()
    logger.info(f"\n--- Create Company Request ---")
    logger.info(f"Received data for creation: {data}")
    logger.info(f"Authenticated user ID: {current_user_id}")

    name = data.get('name')
    email = data.get('email')

    if not name or not email:
        logger.warning("Error: Name and Email are required for company creation.")
        return jsonify({'error': 'Name and Email are required'}), 400

    phone = data.get('phone')
    description = data.get('description')
    status = data.get('status', 'pending')

    region_id = data.get('region_id')
    service_ids = data.get('services', [])
    logger.info(f"Service IDs from request: {service_ids}")

    try:
        region = Region.query.get(region_id) if region_id else None
        
        valid_service_ids = [int(s_id) for s_id in service_ids if s_id is not None]
        services = Service.query.filter(Service.id.in_(valid_service_ids)).all() if valid_service_ids else []
        logger.info(f"Found services for new company: {[s.name for s in services]}")

        new_company = Company(
            name=name,
            email=email,
            phone=phone,
            description=description,
            status=status,
            region=region,
            user=user
        )
        new_company.services = services

        db.session.add(new_company)
        db.session.commit()
        logger.info(f"Company '{new_company.name}' created successfully with ID: {new_company.id}")
        return jsonify({'message': 'Company created', 'id': new_company.id}), 201
    except IntegrityError as e:
        db.session.rollback()
        logger.exception("IntegrityError during company creation:")
        return jsonify({'error': 'Database error: Duplicate entry, invalid foreign key, or data constraint violation.'}), 400
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error during company creation:")
        return jsonify({'error': f'Internal server error during creation: {str(e)}'}), 500


# Update a company (protected by role)
@companies_bp.route('/<int:company_id>', methods=['PUT'])
@role_required(['admin']) # <--- CHANGED: Only admin can update companies
def update_company(company_id):
    current_user_id_str = get_jwt_identity()
    try:
        current_user_id = int(current_user_id_str)
    except (ValueError, TypeError):
        logger.error(f"Invalid user ID in token for update request: {current_user_id_str}")
        return jsonify({'error': 'Invalid user identity in token'}), 401

    logger.info(f"\n--- Update Company Request ---")
    logger.info(f"Update request for company ID: {company_id} by user ID: {current_user_id}")

    company = Company.query.get(company_id)
    if not company:
        logger.warning(f"Company ID {company_id} not found for update.")
        return jsonify({'error': 'Company not found'}), 404

    data = request.get_json()
    logger.info(f"Received update data: {data}")

    try:
        company.name = data.get('name', company.name)
        company.email = data.get('email', company.email)
        company.phone = data.get('phone', company.phone)
        company.description = data.get('description', company.description)
        company.status = data.get('status', company.status)

        region_id = data.get('region_id')
        if region_id is not None:
            region = Region.query.get(region_id) if region_id else None
            if region_id and not region:
                logger.warning(f"Invalid region_id {region_id} provided for update.")
                return jsonify({'error': 'Invalid region_id'}), 400
            company.region = region
            logger.info(f"Updated region to: {region.name if region else 'None'}")

        service_ids = data.get('services')
        if service_ids is not None:
            valid_service_ids = [int(s_id) for s_id in service_ids if s_id is not None]
            services = Service.query.filter(Service.id.in_(valid_service_ids)).all() if valid_service_ids else []
            company.services = services
            logger.info(f"Updated services to: {[s.name for s in services]}")

        db.session.commit()
        logger.info(f"Company ID {company_id} updated successfully.")
        return jsonify({'message': 'Company updated successfully', 'company': serialize_company(company)})
    except IntegrityError as e:
        db.session.rollback()
        logger.exception("IntegrityError during company update:")
        return jsonify({'error': 'Database error during update: Duplicate entry or invalid foreign key.'}), 400
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error during company update:")
        return jsonify({'error': f'Internal server error during update: {str(e)}'}), 500

# Delete a company (protected by role)
@companies_bp.route('/<int:company_id>', methods=['DELETE'])
@role_required(['admin']) # Only admin can delete companies (already correct)
def delete_company(company_id):
    current_user_id_str = get_jwt_identity()
    try:
        current_user_id = int(current_user_id_str)
    except (ValueError, TypeError):
        logger.error(f"Invalid user ID in token for delete request: {current_user_id_str}")
        return jsonify({'error': 'Invalid user identity in token'}), 401

    logger.info(f"\n--- Delete Company Request ---")
    logger.info(f"Delete request for company ID: {company_id} by user ID: {current_user_id}")

    try:
        company = Company.query.get(company_id)

        if not company:
            logger.warning(f"Company ID {company_id} not found for deletion.")
            return jsonify({'error': 'Company not found'}), 404

        db.session.delete(company)
        db.session.commit()
        logger.info(f"Company ID {company_id} deleted successfully.")
        return jsonify({'message': 'Company deleted successfully'}), 200

    except IntegrityError as e:
        db.session.rollback()
        logger.exception("Database IntegrityError during company deletion:")
        return jsonify({
            'error': 'Cannot delete company due to existing related records. Please remove associated data or adjust database constraints first.'
        }), 400
    except Exception as e:
        db.session.rollback()
        logger.exception(f"An unexpected error occurred during company deletion for ID {company_id}:")
        return jsonify({'error': 'Internal server error during deletion. Check server logs for details.'}), 500
