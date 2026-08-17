#!/usr/bin/env python3
"""
Hotel Management System Backend Setup Script
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"\n🔨 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return None

def check_python_version():
    """Check if Python version is 3.8 or higher"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")

def setup_virtual_environment():
    """Create and activate virtual environment"""
    if not os.path.exists('venv'):
        print("\n📦 Creating virtual environment...")
        run_command('python -m venv venv', 'Virtual environment creation')
    else:
        print("✅ Virtual environment already exists")
    
    # Activation command differs by OS
    if os.name == 'nt':  # Windows
        activate_script = 'venv\\Scripts\\activate'
        pip_command = 'venv\\Scripts\\pip'
    else:  # Unix/Linux/MacOS
        activate_script = 'source venv/bin/activate'
        pip_command = 'venv/bin/pip'
    
    return pip_command

def install_dependencies(pip_command):
    """Install Python dependencies"""
    print("\n📚 Installing dependencies...")
    run_command(f'{pip_command} install --upgrade pip', 'Pip upgrade')
    run_command(f'{pip_command} install -r requirements.txt', 'Dependencies installation')

def setup_environment_file():
    """Create .env file from example if it doesn't exist"""
    env_file = Path('.env')
    example_file = Path('.env.example')
    
    if not env_file.exists() and example_file.exists():
        print("\n⚙️ Creating .env file...")
        with open(example_file, 'r') as src, open(env_file, 'w') as dst:
            content = src.read()
            # Generate a random secret key
            import secrets
            secret_key = secrets.token_hex(32)
            jwt_secret = secrets.token_hex(32)
            
            content = content.replace('your-secret-key-here', secret_key)
            content = content.replace('your-jwt-secret-key-here', jwt_secret)
            dst.write(content)
        print("✅ .env file created with random secret keys")
    elif env_file.exists():
        print("✅ .env file already exists")
    else:
        print("⚠️ .env.example not found, skipping .env creation")

def initialize_database():
    """Initialize the database"""
    print("\n🗄️ Initializing database...")
    
    # Set environment variables for Flask
    os.environ['FLASK_APP'] = 'app.py'
    os.environ['FLASK_CONFIG'] = 'development'
    
    # Initialize migration repository
    run_command('flask db init', 'Migration repository initialization')
    
    # Create initial migration
    run_command('flask db migrate -m "Initial migration"', 'Initial migration creation')
    
    # Apply migrations
    run_command('flask db upgrade', 'Database migration')

def seed_database():
    """Seed the database with initial data"""
    print("\n🌱 Seeding database with sample data...")
    run_command('python seed_data.py', 'Database seeding')

def create_uploads_directory():
    """Create uploads directory"""
    uploads_dir = Path('uploads')
    if not uploads_dir.exists():
        uploads_dir.mkdir(parents=True)
        print("✅ Uploads directory created")
    else:
        print("✅ Uploads directory already exists")

def main():
    """Main setup function"""
    print("🏨 Hotel Management System Backend Setup")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Setup virtual environment
    pip_command = setup_virtual_environment()
    
    # Install dependencies
    install_dependencies(pip_command)
    
    # Setup environment file
    setup_environment_file()
    
    # Create uploads directory
    create_uploads_directory()
    
    # Initialize database
    initialize_database()
    
    # Seed database
    seed_database()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Activate virtual environment:")
    if os.name == 'nt':
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("2. Start the Flask development server:")
    print("   python app.py")
    print("3. The API will be available at http://localhost:5000")
    print("\n👤 Test Accounts:")
    print("• Admin: admin@stayfolio.com / admin123")  
    print("• Hotel Owner: owner@marlowhotel.com / owner123")
    print("• Customer: customer@example.com / customer123")

if __name__ == '__main__':
    main()