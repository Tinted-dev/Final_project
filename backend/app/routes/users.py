# backend/app/routes/users.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
import logging
import traceback
from functools import wraps # Needed for role_required decorator

from ..models import User, db # Import User model and db

logger = logging.getLogger(__name__)

# Re-define role_required here or import from a common utility if it exists elsewhere
# For simplicity, keeping it here for now as it's used in this file.
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
            
            kwargs['current_user'] = user 
            return fn(*args, **kwargs)
        return wrapper
    return decorator

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/me', methods=['GET'])
@jwt_required() # This endpoint is for any authenticated user
def get_my_profile():
    """
    Returns the currently authenticated user's details.
    """
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role
    }
    # If the user is a company owner, include their company_id
    if user.role == 'company_owner' and user.company_profile:
        user_data['company_id'] = user.company_profile.id

    logger.info(f"User '{user.username}' fetched their profile.")
    return jsonify(user_data)

@users_bp.route('/me', methods=['PUT'])
@jwt_required() # This endpoint is for any authenticated user to update their own profile
def update_my_profile():
    """
    Allows the currently authenticated user to update their own profile details.
    """
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    new_username = data.get('username')
    new_email = data.get('email')
    new_password = data.get('password') # This would be a new password, not current

    # Update username if provided and unique
    if new_username and new_username != user.username:
        if User.query.filter(User.username == new_username, User.id != user.id).first():
            return jsonify({'error': 'Username already taken'}), 409
        user.username = new_username
        logger.info(f"User ID {user.id} updated username to {new_username}.")

    # Update email if provided and unique
    if new_email and new_email != user.email:
        if User.query.filter(User.email == new_email, User.id != user.id).first():
            return jsonify({'error': 'Email already taken'}), 409
        user.email = new_email
        logger.info(f"User ID {user.id} updated email to {new_email}.")

    # Update password if provided
    if new_password:
        user.set_password(new_password)
        logger.info(f"User ID {user.id} updated password.")

    try:
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    except IntegrityError as e:
        db.session.rollback()
        logger.exception("IntegrityError during user profile update:")
        return jsonify({'error': 'Database error: Duplicate entry for username or email.'}), 400
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error during user profile update:")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# Other user management endpoints (e.g., for admin to manage all users) would go here
# For example:
# @users_bp.route('/', methods=['GET'])
# @role_required(['admin'])
# def get_all_users(current_user): # Admin can get all users
#     users = User.query.all()
#     return jsonify([{'id': u.id, 'username': u.username, 'email': u.email, 'role': u.role} for u in users])
