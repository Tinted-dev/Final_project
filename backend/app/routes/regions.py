# backend/app/routes/regions.py
from flask import Blueprint, jsonify, request
import logging
from sqlalchemy.exc import IntegrityError
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity # <--- ADDED: Import jwt_required and get_jwt_identity

from ..models import Region, User, db

logger = logging.getLogger(__name__)

# Custom decorator for role-based access control (copied for self-containment)
# This should ideally be in a shared utility file if used across multiple blueprints
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

            logger.info(f"Role Check: User '{user.username}' (ID: {user.id}) has role: '{user.role}'. Allowed roles: {allowed_roles}")

            if user.role not in allowed_roles:
                logger.warning(f"Access Denied: User '{user.username}' (role: {user.role}) attempted to access restricted resource. Allowed roles: {allowed_roles}")
                return jsonify({'msg': 'Access Denied: Insufficient permissions'}), 403 # Forbidden
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# Helper function to serialize a region
def serialize_region(region):
    return {
        'id': region.id,
        'name': region.name,
        'description': region.description
    }

regions_bp = Blueprint('regions', __name__, url_prefix='/api/regions')

# Get all regions (Publicly accessible for dropdowns, etc.)
@regions_bp.route('/', methods=['GET'])
def get_regions():
    """
    Retrieves all regions from the database.
    """
    logger.info("Fetching all regions.")
    regions = Region.query.all()
    results = [serialize_region(r) for r in regions]
    return jsonify(results)

# Get region by ID (Publicly accessible)
@regions_bp.route('/<int:region_id>', methods=['GET'])
def get_region(region_id):
    """
    Retrieves a single region by its ID.
    """
    logger.info(f"Fetching region with ID: {region_id}")
    region = Region.query.get_or_404(region_id)
    return jsonify(serialize_region(region))

# Create a new region (Admin only)
@regions_bp.route('/', methods=['POST'])
@role_required(['admin']) # Only admin can create regions
def create_region():
    """
    Creates a new region. Admin access required.
    """
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')

    if not name:
        return jsonify({'error': 'Region name is required'}), 400

    try:
        new_region = Region(name=name, description=description)
        db.session.add(new_region)
        db.session.commit()
        logger.info(f"Region '{new_region.name}' created successfully with ID: {new_region.id}")
        return jsonify({'message': 'Region created', 'id': new_region.id}), 201
    except IntegrityError as e:
        db.session.rollback()
        logger.exception("IntegrityError during region creation:")
        return jsonify({'error': 'Database error: Region name might already exist.'}), 400
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error during region creation:")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# Update an existing region (Admin only)
@regions_bp.route('/<int:region_id>', methods=['PUT'])
@role_required(['admin']) # Only admin can update regions
def update_region(region_id):
    """
    Updates an existing region by its ID. Admin access required.
    """
    region = Region.query.get_or_404(region_id)
    data = request.get_json()

    name = data.get('name', region.name)
    description = data.get('description', region.description)

    if not name:
        return jsonify({'error': 'Region name is required'}), 400

    try:
        region.name = name
        region.description = description
        db.session.commit()
        logger.info(f"Region ID {region_id} updated successfully.")
        return jsonify({'message': 'Region updated', 'region': serialize_region(region)}), 200
    except IntegrityError as e:
        db.session.rollback()
        logger.exception("IntegrityError during region update:")
        return jsonify({'error': 'Database error: Region name might already exist.'}), 400
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error during region update:")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# Delete a region (Admin only)
@regions_bp.route('/<int:region_id>', methods=['DELETE'])
@role_required(['admin']) # Only admin can delete regions
def delete_region(region_id):
    """
    Deletes a region by its ID. Admin access required.
    """
    region = Region.query.get_or_404(region_id)
    try:
        db.session.delete(region)
        db.session.commit()
        logger.info(f"Region ID {region_id} deleted successfully.")
        return jsonify({'message': 'Region deleted'}), 200
    except IntegrityError as e:
        db.session.rollback()
        logger.exception("IntegrityError during region deletion:")
        return jsonify({'error': 'Cannot delete region due to existing associated companies or locations.'}), 400
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error during region deletion:")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
