from flask import Blueprint, request, jsonify
from ..models import Region, db
from flask_jwt_extended import jwt_required

regions_bp = Blueprint('regions', __name__, url_prefix='/api/regions')

# Get all regions
@regions_bp.route('/', methods=['GET'])
def get_regions():
    regions = Region.query.all()
    results = [{'id': r.id, 'name': r.name} for r in regions]
    return jsonify(results)

# Get a single region
@regions_bp.route('/<int:region_id>', methods=['GET'])
def get_region(region_id):
    region = Region.query.get_or_404(region_id)
    return jsonify({'id': region.id, 'name': region.name})

# Create a region (protected)
@regions_bp.route('/', methods=['POST'])
@jwt_required()
def create_region():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Name is required'}), 400

    if Region.query.filter_by(name=name).first():
        return jsonify({'error': 'Region with that name already exists'}), 400

    new_region = Region(name=name)
    db.session.add(new_region)
    db.session.commit()
    return jsonify({'message': 'Region created', 'id': new_region.id}), 201

# Update a region (protected)
@regions_bp.route('/<int:region_id>', methods=['PUT'])
@jwt_required()
def update_region(region_id):
    region = Region.query.get_or_404(region_id)
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    # Check if name already exists on another region
    existing_region = Region.query.filter_by(name=name).first()
    if existing_region and existing_region.id != region.id:
        return jsonify({'error': 'Region with that name already exists'}), 400

    region.name = name
    db.session.commit()
    return jsonify({'message': 'Region updated'})

# Delete a region (protected)
@regions_bp.route('/<int:region_id>', methods=['DELETE'])
@jwt_required()
def delete_region(region_id):
    region = Region.query.get_or_404(region_id)
    db.session.delete(region)
    db.session.commit()
    return jsonify({'message': 'Region deleted'})
