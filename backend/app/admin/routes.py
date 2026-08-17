from flask import request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Hotel, User
from app.utils import role_required
from app.admin import admin_bp
from app.services.email_service import send_approval_email, send_rejection_email, send_owner_credentials
import secrets
import string

@admin_bp.route('/hotels', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_hotels(user):
    """Get hotels filtered by status for admin dashboard"""
    status = request.args.get('status', 'pending')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    query = Hotel.query
    
    if status != 'all':
        query = query.filter_by(status=status)
    
    hotels = query.order_by(Hotel.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return {
        'hotels': [hotel.to_dict(include_sensitive=True) for hotel in hotels.items],
        'total': hotels.total,
        'pages': hotels.pages,
        'current_page': page,
        'has_next': hotels.has_next,
        'has_prev': hotels.has_prev
    }

@admin_bp.route('/hotels', methods=['POST'])
@jwt_required()
@role_required('admin')  
def create_hotel_admin(user):
    """Admin creates hotel directly and assigns owner"""
    data = request.get_json()
    
    required_fields = [
        'name', 'business_name', 'email', 'phone', 'address',
        'city', 'country', 'room_count', 'category'
    ]
    
    for field in required_fields:
        if not data.get(field):
            return {'error': f'{field} is required'}, 400
    
    owner_id = data.get('owner_id')
    owner_email = data.get('owner_email')
    
    # If owner_id provided, verify it exists
    if owner_id:
        owner = User.query.get(owner_id)
        if not owner:
            return {'error': 'Owner not found'}, 404
        if owner.role not in ['hotel_owner', 'customer']:
            return {'error': 'User cannot be assigned as hotel owner'}, 400
    
    # If owner_email provided, create new owner or find existing
    elif owner_email:
        owner = User.query.filter_by(email=owner_email.strip().lower()).first()
        if not owner:
            # Generate temporary password
            temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
            
            owner = User(
                email=owner_email.strip().lower(),
                role='hotel_owner'
            )
            owner.set_password(temp_password)
            db.session.add(owner)
            db.session.flush()  # Get the ID
            
            # Send credentials email (Event 1)
            try:
                from app.services.email_service import send_owner_welcome_email
                send_owner_welcome_email(owner.email, temp_password, data['name'])
            except Exception as mail_err:
                current_app.logger.error(f"Non-blocking email error on owner creation: {mail_err}")
        else:
            # Update existing user to hotel_owner if needed
            if owner.role == 'customer':
                owner.role = 'hotel_owner'
        
        owner_id = owner.id
    
    else:
        return {'error': 'owner_id or owner_email is required'}, 400
    
    # Create hotel
    hotel = Hotel(
        owner_id=owner_id,
        name=data['name'],
        business_name=data['business_name'],
        email=data['email'],
        phone=data['phone'],
        address=data['address'],
        city=data['city'],
        country=data['country'],
        latitude=data.get('latitude', 0),
        longitude=data.get('longitude', 0),
        description=data.get('description', ''),
        room_count=int(data['room_count']),
        category=data['category'],
        status='approved'  # Admin-created hotels are auto-approved
    )
    
    db.session.add(hotel)
    db.session.commit()
    
    return {
        'message': 'Hotel created successfully',
        'hotel': hotel.to_dict(),
        'owner_created': not bool(data.get('owner_id'))
    }, 201

@admin_bp.route('/hotels/<int:hotel_id>', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_hotel_detail(user, hotel_id):
    """Get full hotel details for admin review"""
    hotel = Hotel.query.get_or_404(hotel_id)
    
    # Include owner information
    owner = User.query.get(hotel.owner_id) if hotel.owner_id else None
    
    hotel_data = hotel.to_dict(include_sensitive=True)
    if owner:
        hotel_data['owner'] = owner.to_dict(include_email=True)
    
    return {'hotel': hotel_data}

@admin_bp.route('/hotels/<int:hotel_id>/approve', methods=['POST'])
@jwt_required()
@role_required('admin')
def approve_hotel(user, hotel_id):
    """Approve hotel application"""
    hotel = Hotel.query.get_or_404(hotel_id)
    
    if hotel.status != 'pending':
        return {'error': 'Hotel is not in pending status'}, 400
    
    hotel.status = 'approved'
    hotel.rejection_reason = None
    
    db.session.commit()
    
    # Send approval email (Event 3) — safe non-blocking
    if hotel.email:
        try:
            from app.services.email_service import send_hotel_approved_email
            send_hotel_approved_email(hotel.email, hotel.name)
        except Exception as mail_err:
            current_app.logger.error(f"Non-blocking email error on approve: {mail_err}")
    
    return {
        'message': 'Hotel approved successfully',
        'hotel': hotel.to_dict()
    }

@admin_bp.route('/hotels/<int:hotel_id>/reject', methods=['POST'])
@jwt_required()
@role_required('admin')
def reject_hotel(user, hotel_id):
    """Reject hotel application"""
    hotel = Hotel.query.get_or_404(hotel_id)
    
    if hotel.status != 'pending':
        return {'error': 'Hotel is not in pending status'}, 400
    
    data = request.get_json()
    reason = data.get('reason', '').strip()
    
    if not reason:
        return {'error': 'Rejection reason is required'}, 400
    
    hotel.status = 'rejected'
    hotel.rejection_reason = reason
    
    db.session.commit()
    
    # Send rejection email (Event 4) — safe non-blocking
    if hotel.email:
        try:
            from app.services.email_service import send_hotel_rejected_email
            send_hotel_rejected_email(hotel.email, hotel.name, reason)
        except Exception as mail_err:
            current_app.logger.error(f"Non-blocking email error on reject: {mail_err}")
    
    return {
        'message': 'Hotel rejected successfully',
        'hotel': hotel.to_dict(include_sensitive=True)
    }

@admin_bp.route('/hotels/<int:hotel_id>/notify', methods=['POST'])
@jwt_required()
@role_required('admin')
def notify_hotel_owner(user, hotel_id):
    """Admin sends an ad-hoc notification email to a hotel owner (Event 5)"""
    hotel = Hotel.query.get_or_404(hotel_id)
    data = request.get_json() or {}
    
    message = data.get('message', '').strip()
    subject = data.get('subject', '').strip()
    
    if not message:
        return {'error': 'Message text is required'}, 400
        
    owner_email = hotel.email
    if not owner_email and hotel.owner_id:
        owner = User.query.get(hotel.owner_id)
        if owner:
            owner_email = owner.email
            
    if not owner_email:
        return {'error': 'No contact email found for this hotel owner'}, 404
        
    try:
        from app.services.email_service import send_owner_adhoc_notification
        send_owner_adhoc_notification(
            email=owner_email,
            hotel_name=hotel.name,
            message_text=message,
            subject=subject or None
        )
    except Exception as mail_err:
        current_app.logger.error(f"Non-blocking email error on notify: {mail_err}")
        
    return {
        'message': 'Notification sent to hotel owner successfully',
        'hotel_id': hotel.id
    }

@admin_bp.route('/hotels/<int:hotel_id>/suspend', methods=['POST'])
@jwt_required()
@role_required('admin')
def suspend_hotel(user, hotel_id):
    """Suspend hotel"""
    hotel = Hotel.query.get_or_404(hotel_id)
    
    if hotel.status not in ['approved', 'active']:
        return {'error': 'Hotel cannot be suspended in current status'}, 400
    
    data = request.get_json()
    reason = data.get('reason', 'Policy violation')
    
    hotel.status = 'suspended'
    hotel.rejection_reason = reason  # Reuse field for suspension reason
    
    db.session.commit()
    
    return {
        'message': 'Hotel suspended successfully',
        'hotel': hotel.to_dict()
    }

@admin_bp.route('/hotels/<int:hotel_id>/reactivate', methods=['POST'])
@jwt_required()
@role_required('admin')
def reactivate_hotel(user, hotel_id):
    """Reactivate suspended hotel"""
    hotel = Hotel.query.get_or_404(hotel_id)
    
    if hotel.status != 'suspended':
        return {'error': 'Hotel is not suspended'}, 400
    
    hotel.status = 'active'
    hotel.rejection_reason = None
    
    db.session.commit()
    
    return {
        'message': 'Hotel reactivated successfully',
        'hotel': hotel.to_dict()
    }

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_admin_stats(user):
    """Get admin dashboard statistics"""
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    # Hotel counts by status
    hotel_stats = db.session.query(
        Hotel.status,
        func.count(Hotel.id)
    ).group_by(Hotel.status).all()
    
    stats = {
        'hotels': {status: count for status, count in hotel_stats},
        'total_hotels': Hotel.query.count()
    }
    
    # Weekly requests
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_requests = Hotel.query.filter(
        Hotel.created_at >= week_ago,
        Hotel.status == 'pending'
    ).count()
    
    stats['weekly_requests'] = weekly_requests
    
    return stats