from flask import Blueprint, request, jsonify
from ..models import Service, db
from flask_jwt_extended import jwt_required

services_bp = Blueprint('services', __name__, url_prefix='/api/services')

# Get all services
@services_bp.route('/', methods=['GET'])
def get_services():
    services = Service.query.all()
    results = [{'id': s.id, 'name': s.name} for s in services]
    return jsonify(results)

# Get a single service
@services_bp.route('/<int:service_id>', methods=['GET'])
def get_service(service_id):
    service = Service.query.get_or_404(service_id)
    return jsonify({'id': service.id, 'name': service.name})

# Create a service (protected)
@services_bp.route('/', methods=['POST'])
@jwt_required()
def create_service():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Name is required'}), 400

    if Service.query.filter_by(name=name).first():
        return jsonify({'error': 'Service with that name already exists'}), 400

    new_service = Service(name=name)
    db.session.add(new_service)
    db.session.commit()
    return jsonify({'message': 'Service created', 'id': new_service.id}), 201

# Update a service (protected)
@services_bp.route('/<int:service_id>', methods=['PUT'])
@jwt_required()
def update_service(service_id):
    service = Service.query.get_or_404(service_id)
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    existing_service = Service.query.filter_by(name=name).first()
    if existing_service and existing_service.id != service.id:
        return jsonify({'error': 'Service with that name already exists'}), 400

    service.name = name
    db.session.commit()
    return jsonify({'message': 'Service updated'})

# Delete a service (protected)
@services_bp.route('/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    service = Service.query.get_or_404(service_id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({'message': 'Service deleted'})
