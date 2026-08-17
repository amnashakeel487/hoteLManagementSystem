from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Hotel, User, Room
from app.utils import save_file, hotel_owner_required, role_required, validate_file_upload
from app.hotels import hotels_bp
from datetime import date
import json

@hotels_bp.route('/register', methods=['POST'])
def register_hotel():
    """Public hotel registration endpoint"""
    # Handle multipart form data for file uploads
    data = {}
    
    # Extract form fields
    form_fields = [
        'hotelName', 'businessName', 'email', 'phone', 'address', 
        'city', 'country', 'latitude', 'longitude', 'description', 
        'roomCount', 'category'
    ]
    
    for field in form_fields:
        data[field] = request.form.get(field, '').strip()
    
    # Validate required fields
    required_fields = [
        'hotelName', 'businessName', 'email', 'phone', 
        'address', 'city', 'country', 'roomCount', 'category'
    ]
    
    for field in required_fields:
        if not data.get(field):
            return {'error': f'{field} is required'}, 400
    
    try:
        room_count = int(data['roomCount'])
        latitude = float(data.get('latitude', 0))
        longitude = float(data.get('longitude', 0))
    except (ValueError, TypeError):
        return {'error': 'Invalid numeric values'}, 400
    
    # Handle file uploads
    file_fields = {
        'businessLicense': 'license_path',
        'cnicDoc': 'id_doc_path', 
        'logo': 'logo_path',
        'cover': 'cover_path'
    }
    
    file_paths = {}
    for form_field, db_field in file_fields.items():
        if form_field in request.files:
            file = request.files[form_field]
            validated_file, error = validate_file_upload(file)
            if error and form_field in ['logo', 'cover']:  # Required files
                return {'error': f'{form_field}: {error}'}, 400
            elif validated_file:
                file_path = save_file(validated_file, f'hotels/{form_field.lower()}')
                if file_path:
                    file_paths[db_field] = file_path
    
    # Create hotel record
    hotel = Hotel(
        owner_id=None,  # Will be set by admin or during owner creation
        name=data['hotelName'],
        business_name=data['businessName'], 
        email=data['email'],
        phone=data['phone'],
        address=data['address'],
        city=data['city'],
        country=data['country'],
        latitude=latitude,
        longitude=longitude,
        description=data.get('description', ''),
        room_count=room_count,
        category=data['category'],
        status='pending',
        **file_paths
    )
    
    db.session.add(hotel)
    db.session.commit()
    
    # TODO: Send notification email to admins
    
    return {
        'message': 'Hotel registration submitted successfully',
        'hotel_id': hotel.id,
        'status': 'pending'
    }, 201

@hotels_bp.route('/<int:hotel_id>', methods=['GET'])
@jwt_required()
@hotel_owner_required
def get_hotel(user, hotel):
    """Get hotel details (owner or admin only)"""
    include_sensitive = user.role == 'admin'
    return {'hotel': hotel.to_dict(include_sensitive=include_sensitive)}

@hotels_bp.route('/<int:hotel_id>', methods=['PATCH'])
@jwt_required()  
@hotel_owner_required
def update_hotel(user, hotel):
    """Update hotel details"""
    # Check if hotel can be edited
    if hotel.status not in ['draft', 'rejected', 'approved', 'active']:
        return {'error': 'Hotel cannot be edited in current status'}, 400
    
    data = request.get_json()
    if not data:
        return {'error': 'No data provided'}, 400
    
    # Editable fields
    editable_fields = [
        'name', 'business_name', 'email', 'phone', 'address',
        'city', 'country', 'latitude', 'longitude', 'description',
        'room_count', 'category'
    ]
    
    for field in editable_fields:
        if field in data:
            setattr(hotel, field, data[field])
    
    # If hotel was rejected and is being updated, change status to pending
    if hotel.status == 'rejected':
        hotel.status = 'pending'
        hotel.rejection_reason = None
    
    db.session.commit()
    
    return {
        'message': 'Hotel updated successfully',
        'hotel': hotel.to_dict()
    }

@hotels_bp.route('/<int:hotel_id>/gallery', methods=['POST'])
@jwt_required()
@hotel_owner_required  
def upload_gallery_images(user, hotel):
    """Upload gallery images for hotel"""
    if 'images' not in request.files:
        return {'error': 'No images provided'}, 400
    
    files = request.files.getlist('images')
    if not files:
        return {'error': 'No images provided'}, 400
    
    uploaded_paths = []
    current_gallery = hotel.get_gallery_paths()
    
    for file in files:
        validated_file, error = validate_file_upload(file)
        if error:
            continue  # Skip invalid files
        
        file_path = save_file(validated_file, f'hotels/gallery')
        if file_path:
            uploaded_paths.append(file_path)
    
    if not uploaded_paths:
        return {'error': 'No valid images uploaded'}, 400
    
    # Add to existing gallery
    new_gallery = current_gallery + uploaded_paths
    hotel.set_gallery_paths(new_gallery)
    
    db.session.commit()
    
    return {
        'message': f'{len(uploaded_paths)} images uploaded successfully',
        'gallery_paths': new_gallery
    }

@hotels_bp.route('/<int:hotel_id>/rooms', methods=['GET'])
@jwt_required()
@hotel_owner_required
def get_hotel_rooms(user, hotel):
    """Get all rooms for a hotel"""
    rooms = Room.query.filter_by(hotel_id=hotel.id).all()
    return {'rooms': [room.to_dict() for room in rooms]}

@hotels_bp.route('/<int:hotel_id>/rooms', methods=['POST'])
@jwt_required()
@hotel_owner_required
def create_room(user, hotel):
    """Create a new room category"""
    data = request.get_json()
    
    required_fields = ['category', 'price', 'total_units']
    for field in required_fields:
        if field not in data:
            return {'error': f'{field} is required'}, 400
    
    try:
        price = float(data['price'])
        total_units = int(data['total_units'])
    except (ValueError, TypeError):
        return {'error': 'Invalid numeric values'}, 400
    
    room = Room(
        hotel_id=hotel.id,
        category=data['category'],
        price=price,
        total_units=total_units
    )
    
    if 'amenities' in data:
        room.set_amenities(data['amenities'])
    
    if 'photos' in data:
        room.set_photos(data['photos'])
    
    db.session.add(room)
    db.session.commit()
    
    return {
        'message': 'Room category created successfully',
        'room': room.to_dict()
    }, 201

@hotels_bp.route('/<int:hotel_id>/rooms/<int:room_id>', methods=['PATCH'])
@jwt_required()
@hotel_owner_required
def update_room(user, hotel, room_id):
    """Update room category"""
    room = Room.query.filter_by(id=room_id, hotel_id=hotel.id).first()
    
    if not room:
        return {'error': 'Room not found'}, 404
    
    data = request.get_json()
    if not data:
        return {'error': 'No data provided'}, 400
    
    editable_fields = ['category', 'price', 'total_units']
    for field in editable_fields:
        if field in data:
            setattr(room, field, data[field])
    
    if 'amenities' in data:
        room.set_amenities(data['amenities'])
    
    if 'photos' in data:
        room.set_photos(data['photos'])
    
    db.session.commit()
    
    return {
        'message': 'Room updated successfully',
        'room': room.to_dict()
    }

@hotels_bp.route('/<int:hotel_id>/rooms/<int:room_id>', methods=['DELETE'])
@jwt_required()
@hotel_owner_required
def delete_room(user, hotel, room_id):
    """Delete room category"""
    room = Room.query.filter_by(id=room_id, hotel_id=hotel.id).first()
    
    if not room:
        return {'error': 'Room not found'}, 404
    
    # Check if room has active bookings
    from app.models import Booking
    active_bookings = Booking.query.filter_by(room_id=room.id, status='approved').count()
    if active_bookings > 0:
        return {'error': 'Cannot delete room with active bookings'}, 400
    
    db.session.delete(room)
    db.session.commit()
    
    return {'message': 'Room deleted successfully'}

@hotels_bp.route('/<int:hotel_id>/bookings', methods=['GET'])
@jwt_required()
@hotel_owner_required
def get_hotel_bookings(user, hotel):
    """Get all bookings for a hotel"""
    from app.models import Booking
    
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    query = Booking.query.filter_by(hotel_id=hotel.id)
    
    if status:
        query = query.filter_by(status=status)
    
    bookings = query.order_by(Booking.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return {
        'bookings': [booking.to_dict() for booking in bookings.items],
        'total': bookings.total,
        'pages': bookings.pages,
        'current_page': page
    }

@hotels_bp.route('/<int:hotel_id>/reviews', methods=['GET'])
@jwt_required()
@hotel_owner_required
def get_hotel_reviews(user, hotel):
    """Get all reviews for a hotel"""
    from app.models import Review
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    reviews = Review.query.filter_by(hotel_id=hotel.id).order_by(
        Review.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return {
        'reviews': [review.to_dict() for review in reviews.items],
        'total': reviews.total,
        'pages': reviews.pages,
        'current_page': page
    }

@hotels_bp.route('/<int:hotel_id>/cleaning-requests', methods=['GET'])
@jwt_required()
@hotel_owner_required
def get_cleaning_requests(user, hotel):
    """Get cleaning requests for a hotel"""
    from app.models import CleaningRequest
    
    requests = CleaningRequest.query.filter_by(hotel_id=hotel.id).order_by(
        CleaningRequest.created_at.desc()
    ).all()
    
    return {'cleaning_requests': [req.to_dict() for req in requests]}

@hotels_bp.route('/<int:hotel_id>/cleaning-requests', methods=['POST'])
@jwt_required()
@hotel_owner_required
def create_cleaning_request(user, hotel):
    """Create a cleaning request"""
    from app.models import CleaningRequest, Booking
    from app.services.email_service import send_cleaning_request_confirmation
    from datetime import datetime, timedelta
    
    # Check eligibility - must have bookings this month >= threshold
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    monthly_bookings = Booking.query.filter(
        Booking.hotel_id == hotel.id,
        Booking.status == 'approved',
        Booking.created_at >= current_month_start
    ).count()
    
    # Eligibility threshold (configurable)
    eligibility_threshold = 10
    
    if monthly_bookings < eligibility_threshold:
        return {
            'error': f'Not eligible. Need at least {eligibility_threshold} bookings this month. Current: {monthly_bookings}'
        }, 400
    
    # Check if there's already a pending request
    existing_request = CleaningRequest.query.filter_by(
        hotel_id=hotel.id,
        status='requested'
    ).first()
    
    if existing_request:
        return {'error': 'You already have a pending cleaning request'}, 400
    
    data = request.get_json() or {}
    booking_id = data.get('booking_id')  # Optional, for specific booking
    
    # Validate booking_id if provided
    if booking_id:
        booking = Booking.query.filter_by(
            id=booking_id,
            hotel_id=hotel.id,
            status='approved'
        ).first()
        if not booking:
            return {'error': 'Invalid booking ID'}, 400
    
    # Create cleaning request
    cleaning_request = CleaningRequest(
        hotel_id=hotel.id,
        booking_id=booking_id,
        status='requested'
    )
    
    db.session.add(cleaning_request)
    db.session.commit()
    
    # Send confirmation email
    send_cleaning_request_confirmation(hotel.email, hotel.name, cleaning_request.id)
    
    return {
        'message': 'Cleaning request submitted successfully',
        'cleaning_request': cleaning_request.to_dict()
    }, 201

@hotels_bp.route('/rooms/<int:room_id>/availability', methods=['GET'])
@jwt_required()
def get_room_availability(room_id):
    """Get room availability calendar"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    room = Room.query.get_or_404(room_id)
    hotel = room.hotel
    
    # Check permission
    if user.role != 'admin' and hotel.owner_id != user.id:
        return {'error': 'Access denied'}, 403
    
    from app.models import Availability
    from datetime import datetime, timedelta
    import calendar
    
    # Get date range (default to current month)
    year = request.args.get('year', datetime.utcnow().year, type=int)
    month = request.args.get('month', datetime.utcnow().month, type=int)
    
    # Get first and last day of month
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)
    
    # Get availability records for the month
    availabilities = Availability.query.filter(
        Availability.room_id == room_id,
        Availability.date >= first_day,
        Availability.date <= last_day
    ).all()
    
    # Convert to dict for easy lookup
    availability_dict = {av.date: av.status for av in availabilities}
    
    # Generate calendar data
    calendar_data = []
    current_date = first_day
    
    while current_date <= last_day:
        status = availability_dict.get(current_date, 'open')
        calendar_data.append({
            'date': current_date.isoformat(),
            'status': status,
            'day': current_date.day
        })
        current_date += timedelta(days=1)
    
    return {
        'room_id': room_id,
        'year': year,
        'month': month,
        'calendar': calendar_data
    }

@hotels_bp.route('/rooms/<int:room_id>/availability', methods=['PATCH'])
@jwt_required()
def update_room_availability(room_id):
    """Update room availability status"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    room = Room.query.get_or_404(room_id)
    hotel = room.hotel
    
    # Check permission
    if user.role != 'admin' and hotel.owner_id != user.id:
        return {'error': 'Access denied'}, 403
    
    from app.models import Availability
    from datetime import datetime
    
    data = request.get_json()
    if not data:
        return {'error': 'No data provided'}, 400
    
    date_str = data.get('date')
    status = data.get('status')
    
    if not date_str or not status:
        return {'error': 'Date and status are required'}, 400
    
    if status not in ['open', 'booked', 'hold']:
        return {'error': 'Invalid status'}, 400
    
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return {'error': 'Invalid date format. Use YYYY-MM-DD'}, 400
    
    # Find or create availability record
    availability = Availability.query.filter_by(
        room_id=room_id,
        date=target_date
    ).first()
    
    if availability:
        availability.status = status
    else:
        availability = Availability(
            room_id=room_id,
            date=target_date,
            status=status
        )
        db.session.add(availability)
    
    db.session.commit()
    
    return {
        'message': 'Availability updated successfully',
        'availability': availability.to_dict()
    }