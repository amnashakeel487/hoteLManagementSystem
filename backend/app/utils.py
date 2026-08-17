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

def _upload_to_cloudinary(file, subfolder=''):
    """Upload file to Cloudinary and return the secure URL."""
    try:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
            api_key=os.environ.get('CLOUDINARY_API_KEY'),
            api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
            secure=True
        )

        folder = f"stayfolio/{subfolder}" if subfolder else "stayfolio"
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type='auto'
        )
        # Return the full HTTPS URL so it can be opened anywhere
        return result.get('secure_url')
    except Exception as e:
        current_app.logger.error(f"Cloudinary upload failed: {e}")
        return None

def save_file(file, subfolder=''):
    """Save uploaded file.
    Uses Cloudinary when CLOUDINARY_CLOUD_NAME env var is set (production),
    falls back to local filesystem otherwise (development).
    Always returns the path/URL stored in the database.
    """
    if not file or not allowed_file(file.filename):
        return None

    # ── CLOUDINARY (production) ─────────────────────────────────────────────
    if os.environ.get('CLOUDINARY_CLOUD_NAME'):
        file.seek(0)
        return _upload_to_cloudinary(file, subfolder)

    # ── LOCAL FILESYSTEM (development fallback) ─────────────────────────────
    filename = secure_filename(file.filename)
    name, ext = os.path.splitext(filename)
    unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"

    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(upload_path, exist_ok=True)

    filepath = os.path.join(upload_path, unique_filename)
    file.seek(0)
    file.save(filepath)

    return os.path.join(subfolder, unique_filename).replace('\\', '/')

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
        
        # Get and remove hotel_id from URL parameters / kwargs so it's not passed as duplicate unexpected arg
        hotel_id = kwargs.pop('hotel_id', None) or (request.view_args and request.view_args.get('hotel_id'))
        if not hotel_id:
            return {'error': 'Hotel ID required'}, 400
        
        hotel = Hotel.query.get(int(hotel_id))
        if not hotel:
            return {'error': 'Hotel not found'}, 404
        
        # Check if user is admin or owns the hotel
        if user.role != 'admin' and hotel.owner_id != user.id:
            return {'error': 'Access denied'}, 403
        
        return f(user, hotel, *args, **kwargs)
    return decorated_function

def get_file_url(file_path):
    """Generate URL for an uploaded file.
    - If the path is already a full URL (Cloudinary), return as-is.
    - Otherwise, build a local /uploads/<path> URL.
    """
    if not file_path:
        return None
    if file_path.startswith('http'):
        return file_path
    return f"/uploads/{file_path}"

def validate_file_upload(file, max_size_mb=10):
    """Validate uploaded file"""
    if not file or file.filename == '':
        return None, "No file provided"
    
    if not allowed_file(file.filename):
        return None, f"File type not allowed. Allowed: {', '.join(current_app.config['ALLOWED_EXTENSIONS'])}"
    
    # Check file size
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    
    if size > max_size_mb * 1024 * 1024:
        return None, f"File too large. Maximum size: {max_size_mb}MB"
    
    return file, None