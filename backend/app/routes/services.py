# backend/app/routes/services.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
import traceback
import logging
from functools import wraps # Import wraps for decorators

from ..models import Service, User, db # Import Service and User models
# Assuming role_required is available from a common utility or companies.py
# For now, we'll copy it here for self-containment, but ideally it's in a shared module.

logger = logging.getLogger(__name__)

# Custom decorator for role-based access control (copied for self-containment)
def role_required(allowed_roles):
    """
    Decorator to restrict access to a route based on user roles.
    Requires @jwt_required() to be applied before this decorator.
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
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

            logger.info(f"Role Check: User '{user.username}' (ID: {user.id}) has role: '{user.role}'. Allowed roles: {allowed_roles}")

            if user.role not in allowed_roles:
                logger.warning(f"Access Denied: User '{user.username}' (role: {user.role}) attempted to access restricted resource. Allowed roles: {allowed_roles}")
                return jsonify({'msg': 'Access Denied: Insufficient permissions'}), 403 # Forbidden
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# Helper function to serialize a service
def serialize_service(service):
    return {
        'id': service.id,
        'name': service.name,
        'description': service.description,
        # If you need to show companies associated with a service, you would add:
        # 'companies': [{'id': c.id, 'name': c.name} for c in service.companies]
    }

services_bp = Blueprint('services', __name__, url_prefix='/api/services')

# Get all services
@services_bp.route('/', methods=['GET'])
def get_services():
    services = Service.query.all()
    results = [serialize_service(s) for s in services]
    return jsonify(results)

# Get service by ID
@services_bp.route('/<int:service_id>', methods=['GET'])
def get_service(service_id):
    service = Service.query.get_or_404(service_id)
    return jsonify(serialize_service(service))

# Create a new service (Admin only)
@services_bp.route('/', methods=['POST'])
@role_required(['admin']) # Only admin can create services
def create_service():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')

    if not name:
        return jsonify({'error': 'Service name is required'}), 400

    try:
        new_service = Service(name=name, description=description)
        db.session.add(new_service)
        db.session.commit()
        logger.info(f"Service '{new_service.name}' created successfully with ID: {new_service.id}")
        return jsonify({'message': 'Service created', 'id': new_service.id}), 201
    except IntegrityError as e:
        db.session.rollback()
        logger.exception("IntegrityError during service creation:")
        return jsonify({'error': 'Database error: Service name might already exist.'}), 400
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error during service creation:")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# Update a service (Admin only)
@services_bp.route('/<int:service_id>', methods=['PUT'])
@role_required(['admin']) # Only admin can update services
def update_service(service_id):
    service = Service.query.get_or_404(service_id)
    data = request.get_json()

    name = data.get('name', service.name)
    description = data.get('description', service.description)

    if not name:
        return jsonify({'error': 'Service name is required'}), 400

    try:
        service.name = name
        service.description = description
        db.session.commit()
        logger.info(f"Service ID {service_id} updated successfully.")
        return jsonify({'message': 'Service updated', 'service': serialize_service(service)}), 200
    except IntegrityError as e:
        db.session.rollback()
        logger.exception("IntegrityError during service update:")
        return jsonify({'error': 'Database error: Service name might already exist.'}), 400
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error during service update:")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# Delete a service (Admin only)
@services_bp.route('/<int:service_id>', methods=['DELETE'])
@role_required(['admin']) # Only admin can delete services
def delete_service(service_id):
    service = Service.query.get_or_404(service_id)
    try:
        db.session.delete(service)
        db.session.commit()
        logger.info(f"Service ID {service_id} deleted successfully.")
        return jsonify({'message': 'Service deleted'}), 200
    except IntegrityError as e:
        db.session.rollback()
        logger.exception("IntegrityError during service deletion:")
        return jsonify({'error': 'Cannot delete service due to existing associations or constraints.'}), 400
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error during service deletion:")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
