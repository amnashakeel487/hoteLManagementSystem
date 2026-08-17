from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
limiter = Limiter(key_func=get_remote_address)

def create_app(config_name=None):
    app = Flask(__name__)
    
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'development')
    
    # Load configuration
    from app.config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions with environment-specific CORS
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure robust CORS for local development and all Vercel deployments
    import re
    allowed_origins = [
        re.compile(r"^https?://localhost(:\d+)?$"),
        re.compile(r"^https?://127\.0\.0\.1(:\d+)?$"),
        re.compile(r"^https://.*\.vercel\.app$")
    ]
    
    custom_origins = os.environ.get('CORS_ORIGINS', '')
    if custom_origins:
        for o in custom_origins.split(','):
            cleaned = o.strip()
            if cleaned and cleaned != '*':
                allowed_origins.append(cleaned)
                
    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}, r"/health": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )
    
    mail.init_app(app)
    limiter.init_app(app)
    
    # Register blueprints
    from app.auth import auth_bp
    from app.hotels import hotels_bp
    from app.admin import admin_bp
    from app.bookings import bookings_bp
    from app.reviews import reviews_bp
    from app.analytics import analytics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(hotels_bp, url_prefix='/api/hotels')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    
    @app.route('/')
    @app.route('/health')
    def health_check():
        return {
            'status': 'healthy',
            'message': 'Stayfolio Hotel Management API is running',
            'environment': config_name,
            'version': '1.0.0'
        }
    
    from flask import send_from_directory
    @app.route('/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        """Serve uploaded files (licenses, IDs, images)"""
        upload_folder = os.path.abspath(app.config['UPLOAD_FOLDER'])
        return send_from_directory(upload_folder, filename)
    
    return app