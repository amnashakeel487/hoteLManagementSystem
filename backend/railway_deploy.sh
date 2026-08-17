#!/bin/bash

# Railway Deployment Script
echo "🚀 Starting Railway deployment setup..."

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Set production environment
export FLASK_CONFIG=production
export FLASK_ENV=production

# Initialize database
echo "🗄️ Initializing database..."
python -c "
from app import create_app, db
app = create_app('production')
with app.app_context():
    db.create_all()
    print('Database tables created successfully!')
"

# Seed database with sample data
echo "🌱 Seeding database..."
python production_seed.py

echo "✅ Railway deployment setup complete!"
echo "🎯 Your API is ready at: https://your-app.railway.app"