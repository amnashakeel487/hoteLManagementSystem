import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app, request
from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models import User, Hotel

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def save_file(file, subfolder=''):
    """Save uploaded file and return the file path"""
    if file and allowed_file(file.filename):
        # Generate unique filename
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
        
        # Create upload directory if it doesn't exist
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
        os.makedirs(upload_path, exist_ok=True)
        
        # Save file
        filepath = os.path.join(upload_path, unique_filename)
        file.save(filepath)
        
        # Return relative path for database storage
        return os.path.join(subfolder, unique_filename).replace('\\', '/')
    
    return None

def role_required(*roles):
    """Decorator to check if user has required role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(int(current_user_id))
            
            if not user or user.role not in roles:
                return {'error': 'Insufficient permissions'}, 403
            
            return f(user, *args, **kwargs)
        return decorated_function
    return decorator

def hotel_owner_required(f):
    """Decorator to check if user is hotel owner and owns the hotel"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return {'error': 'User not found'}, 404
        
        # Get hotel_id from URL parameters or request data
        hotel_id = kwargs.get('hotel_id') or request.view_args.get('hotel_id')
        if not hotel_id:
            return {'error': 'Hotel ID required'}, 400
        
        hotel = Hotel.query.get(hotel_id)
        if not hotel:
            return {'error': 'Hotel not found'}, 404
        
        # Check if user is admin or owns the hotel
        if user.role != 'admin' and hotel.owner_id != user.id:
            return {'error': 'Access denied'}, 403
        
        return f(user, hotel, *args, **kwargs)
    return decorated_function

def get_file_url(file_path):
    """Generate URL for uploaded file"""
    if not file_path:
        return None
    # In production, this would return a proper URL (S3, CDN, etc.)
    return f"/uploads/{file_path}"

def validate_file_upload(file, max_size_mb=10):
    """Validate uploaded file"""
    if not file or file.filename == '':
        return None, "No file provided"
    
    if not allowed_file(file.filename):
        return None, f"File type not allowed. Allowed: {', '.join(current_app.config['ALLOWED_EXTENSIONS'])}"
    
    # Check file size (approximate, since we can't get exact size without reading)
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    
    if size > max_size_mb * 1024 * 1024:
        return None, f"File too large. Maximum size: {max_size_mb}MB"
    
    return file, None