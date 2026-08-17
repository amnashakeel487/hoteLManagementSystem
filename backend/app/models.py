from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='customer')  # admin, hotel_owner, customer
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    hotels = db.relationship('Hotel', backref='owner', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_email=False):
        data = {
            'id': self.id,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }
        if include_email:
            data['email'] = self.email
        return data

class Hotel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    name = db.Column(db.String(200), nullable=False)
    business_name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.Text, nullable=False)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    description = db.Column(db.Text)
    room_count = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    
    # File paths
    license_path = db.Column(db.String(255))
    id_doc_path = db.Column(db.String(255))
    logo_path = db.Column(db.String(255))
    cover_path = db.Column(db.String(255))
    gallery_paths = db.Column(db.Text)  # JSON array of image paths
    
    # Status and approval
    status = db.Column(db.String(20), nullable=False, default='draft')  # draft, pending, approved, rejected, active, suspended
    rejection_reason = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rooms = db.relationship('Room', backref='hotel', lazy='dynamic', cascade='all, delete-orphan')
    bookings = db.relationship('Booking', backref='hotel', lazy='dynamic')
    reviews = db.relationship('Review', backref='hotel', lazy='dynamic')
    cleaning_requests = db.relationship('CleaningRequest', backref='hotel', lazy='dynamic')
    
    def get_gallery_paths(self):
        if self.gallery_paths:
            return json.loads(self.gallery_paths)
        return []
    
    def set_gallery_paths(self, paths):
        self.gallery_paths = json.dumps(paths)
    
    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'owner_id': self.owner_id,
            'name': self.name,
            'business_name': self.business_name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'country': self.country,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'description': self.description,
            'room_count': self.room_count,
            'category': self.category,
            'logo_path': self.logo_path,
            'cover_path': self.cover_path,
            'gallery_paths': self.get_gallery_paths(),
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_sensitive:
            data.update({
                'license_path': self.license_path,
                'id_doc_path': self.id_doc_path,
                'rejection_reason': self.rejection_reason
            })
        
        return data

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    photos = db.Column(db.Text)  # JSON array of photo paths
    amenities = db.Column(db.Text)  # JSON array of amenities
    price = db.Column(db.Numeric(10, 2), nullable=False)
    total_units = db.Column(db.Integer, nullable=False, default=1)
    
    # Relationships
    availabilities = db.relationship('Availability', backref='room', lazy='dynamic', cascade='all, delete-orphan')
    bookings = db.relationship('Booking', backref='room', lazy='dynamic')
    
    def get_photos(self):
        if self.photos:
            return json.loads(self.photos)
        return []
    
    def set_photos(self, photos):
        self.photos = json.dumps(photos)
    
    def get_amenities(self):
        if self.amenities:
            return json.loads(self.amenities)
        return []
    
    def set_amenities(self, amenities):
        self.amenities = json.dumps(amenities)
    
    def to_dict(self):
        return {
            'id': self.id,
            'hotel_id': self.hotel_id,
            'category': self.category,
            'photos': self.get_photos(),
            'amenities': self.get_amenities(),
            'price': float(self.price),
            'total_units': self.total_units
        }

class Availability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='open')  # open, booked, hold
    
    __table_args__ = (db.UniqueConstraint('room_id', 'date', name='unique_room_date'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'room_id': self.room_id,
            'date': self.date.isoformat(),
            'status': self.status
        }

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=False)
    guest_name = db.Column(db.String(200), nullable=False)
    guest_email = db.Column(db.String(120), nullable=False)
    guest_phone = db.Column(db.String(30))
    check_in = db.Column(db.Date, nullable=False)
    check_out = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, approved, rejected
    total_amount = db.Column(db.Numeric(10, 2))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    cleaning_requests = db.relationship('CleaningRequest', backref='booking', lazy='dynamic')
    
    def to_dict(self):
        nights = (self.check_out - self.check_in).days if self.check_in and self.check_out else 1
        hotel = Hotel.query.get(self.hotel_id)
        room = Room.query.get(self.room_id)
        return {
            'id': self.id,
            'reference': f'STAY-{self.id:04d}',
            'room_id': self.room_id,
            'hotel_id': self.hotel_id,
            'hotel_name': hotel.name if hotel else None,
            'hotel_city': hotel.city if hotel else None,
            'hotel_country': hotel.country if hotel else None,
            'hotel_phone': hotel.phone if hotel else None,
            'hotel_email': hotel.email if hotel else None,
            'room_category': room.category if room else None,
            'room_price': float(room.price) if room and room.price else None,
            'guest_name': self.guest_name,
            'guest_email': self.guest_email,
            'guest_phone': self.guest_phone,
            'check_in': self.check_in.isoformat(),
            'check_out': self.check_out.isoformat(),
            'nights': nights,
            'status': self.status,
            'total_amount': float(self.total_amount) if self.total_amount else None,
            'created_at': self.created_at.isoformat()
        }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=False)
    guest_name = db.Column(db.String(200), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column(db.Text)
    owner_reply = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'hotel_id': self.hotel_id,
            'guest_name': self.guest_name,
            'rating': self.rating,
            'comment': self.comment,
            'owner_reply': self.owner_reply,
            'created_at': self.created_at.isoformat()
        }

class CleaningRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='requested')  # requested, assigned, completed
    assigned_team = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'hotel_id': self.hotel_id,
            'booking_id': self.booking_id,
            'status': self.status,
            'assigned_team': self.assigned_team,
            'created_at': self.created_at.isoformat()
        }