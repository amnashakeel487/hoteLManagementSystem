from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Booking, Room, Hotel, User
from app.utils import hotel_owner_required
from app.bookings import bookings_bp
from datetime import datetime

@bookings_bp.route('/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    """Get booking details"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    booking = Booking.query.get_or_404(booking_id)
    
    # Check permission - owner of hotel or admin
    if user.role != 'admin' and booking.hotel.owner_id != user.id:
        return {'error': 'Access denied'}, 403
    
    return {'booking': booking.to_dict()}

@bookings_bp.route('/<int:booking_id>', methods=['PATCH'])
@jwt_required()
def update_booking_status(booking_id):
    """Update booking status (approve/reject)"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    booking = Booking.query.get_or_404(booking_id)
    
    # Check permission - owner of hotel or admin  
    if user.role != 'admin' and booking.hotel.owner_id != user.id:
        return {'error': 'Access denied'}, 403
    
    data = request.get_json()
    status = data.get('status')
    
    if status not in ['approved', 'rejected']:
        return {'error': 'Invalid status. Must be approved or rejected'}, 400
    
    if booking.status != 'pending':
        return {'error': 'Booking is not in pending status'}, 400
    
    booking.status = status
    db.session.commit()
    
    # TODO: Send notification email to guest
    
    return {
        'message': f'Booking {status} successfully',
        'booking': booking.to_dict()
    }

# Hotel-specific booking routes are in hotels blueprint to maintain context