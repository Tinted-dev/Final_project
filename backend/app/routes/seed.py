from flask import Blueprint, jsonify
from ...seed import seed_database  # <-- adjust import to match your file name

seed_bp = Blueprint('seed', __name__)

@seed_bp.route('/seed', methods=['GET'])
def run_seed():
    try:
        seed_database()
        return jsonify({"message": "Database seeded successfully!"}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
