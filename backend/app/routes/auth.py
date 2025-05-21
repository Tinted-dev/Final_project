from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import User, db # Ensure User and db are imported

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({'error': 'Username, email, and password are required'}), 400

    # Check for existing user by either username or email
    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({'error': 'User with this email or username already exists'}), 409

    user = User(username=username, email=email)
    user.set_password(password) # Hash the password

    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Get username and password from the request body
    username_from_request = data.get('username')
    password_from_request = data.get('password')

    # Basic input validation
    if not username_from_request or not password_from_request:
        return jsonify({"msg": "Missing username or password"}), 400

    # Query the user by username
    user = User.query.filter_by(username=username_from_request).first()

    # Check if user exists and password is correct
    if user is None or not user.check_password(password_from_request):
        return jsonify({'msg': 'Invalid username or password'}), 401 # Generic message for security

    # --- CRITICAL FIX: Ensure 'identity' is a string ---
    # `user.id` is typically an integer. Flask-JWT-Extended requires the identity
    # to be a string when embedded in the token's 'sub' (subject) claim.
    access_token = create_access_token(identity=str(user.id)) # Explicitly cast user.id to a string

    # Return the token and user details
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    # get_jwt_identity() retrieves the 'identity' that was set during token creation (user.id as a string)
    user_id = get_jwt_identity() # This will be the string version of user.id

    # Convert back to integer if your User.query.get expects an integer
    user = User.query.get(int(user_id)) # Cast back to int if User.query.get expects int

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role # Include role if you want it on the frontend
    })