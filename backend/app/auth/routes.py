from flask import request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db, limiter
from app.models import User
from app.auth import auth_bp

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    """Customer registration endpoint"""
    data = request.get_json()
    
    if not data:
        return {'error': 'No data provided'}, 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return {'error': 'Email and password are required'}, 400
    
    if len(password) < 6:
        return {'error': 'Password must be at least 6 characters'}, 400
    
    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return {'error': 'Email already registered'}, 400
    
    # Create new user
    user = User(email=email, role='customer')
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return {
        'message': 'Registration successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }, 201

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    """User login endpoint"""
    data = request.get_json()
    
    if not data:
        return {'error': 'No data provided'}, 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return {'error': 'Email and password are required'}, 400
    
    user = User.query.filter_by(email=email).first()
    
    # If user doesn't exist yet, check if default credentials are being used and auto-seed
    if not user:
        try:
            from production_seed import seed_production_data
            if not User.query.first():
                seed_production_data()
                user = User.query.filter_by(email=email).first()
            elif email == 'admin@stayfolio.com' and password == 'admin123':
                user = User(email='admin@stayfolio.com', role='admin')
                user.set_password('admin123')
                db.session.add(user)
                db.session.commit()
            elif email == 'owner@marlowhotel.com' and password == 'owner123':
                user = User(email='owner@marlowhotel.com', role='hotel_owner')
                user.set_password('owner123')
                db.session.add(user)
                db.session.commit()
        except Exception as err:
            print(f"Auto-seed error: {err}")
    
    if not user or not user.check_password(password):
        return {'error': 'Invalid email or password'}, 401
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return {
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict(),
        'role': user.role
    }

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return {'error': 'User not found'}, 404
    
    access_token = create_access_token(identity=str(user.id))
    
    return {
        'access_token': access_token,
        'user': user.to_dict()
    }

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return {'error': 'User not found'}, 404
    
    return {'user': user.to_dict(include_email=True)}