from app import create_app, db
from app.models import User, Hotel, Room, Booking, Review, CleaningRequest
import os

# Create Flask app with environment-based configuration
config_name = os.environ.get('FLASK_CONFIG', 'development')
app = create_app(config_name)

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Hotel': Hotel,
        'Room': Room,
        'Booking': Booking,
        'Review': Review,
        'CleaningRequest': CleaningRequest
    }

# Add a health check route for Railway
@app.route('/')
@app.route('/health')
def health_check():
    return {
        'status': 'healthy',
        'message': 'Stayfolio Hotel Management API is running',
        'environment': config_name,
        'version': '1.0.0'
    }

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)