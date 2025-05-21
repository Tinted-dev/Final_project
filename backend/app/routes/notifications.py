from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

# Example: Get notifications for the logged-in user
@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    # This is just a stub response
    notifications = [
        {"id": 1, "message": "Your company profile was updated.", "user_id": user_id},
        {"id": 2, "message": "New service added in your region.", "user_id": user_id}
    ]
    return jsonify(notifications)

# Example: Send a test notification (would be expanded later)
@notifications_bp.route('/send-test', methods=['POST'])
@jwt_required()
def send_test_notification():
    user_id = get_jwt_identity()
    data = request.get_json()
    message = data.get("message", "This is a test notification.")
    # In real app, you'd save to DB or push notification here
    return jsonify({"msg": f"Notification sent to user {user_id}: {message}"})
