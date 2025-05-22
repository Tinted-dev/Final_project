from flask import Blueprint, jsonify
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from seed import seed_database  # ✅ Correct absolute import after path fix


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
