#!/usr/bin/env python3
"""
Production seed script for Railway deployment
Run this after deploying to Railway to initialize the database with sample data
"""

import os
import sys
from werkzeug.security import generate_password_hash
from datetime import datetime

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, Hotel, Room, Booking, Review, CleaningRequest

def seed_production_data():
    """Seed the production database with initial data"""
    
    print("🌱 Starting production database seeding...")
    
    # Create admin user
    admin = User(
        email='admin@stayfolio.com',
        password_hash=generate_password_hash('admin123'),
        role='admin'
    )
    
    # Create hotel owner user
    owner = User(
        email='owner@marlowhotel.com',
        password_hash=generate_password_hash('owner123'),
        role='hotel_owner'
    )
    
    db.session.add(admin)
    db.session.add(owner)
    db.session.flush()  # Get IDs
    
    print("✅ Created admin and owner users")
    
    # Create sample hotel
    hotel = Hotel(
        owner_id=owner.id,
        name='The Marlow Hotel',
        business_name='Marlow Hospitality Ltd',
        email='info@marlowhotel.com',
        phone='+92 300 1234567',
        address='123 Main Street, Gulberg',
        city='Lahore',
        country='Pakistan',
        latitude=31.5497,
        longitude=74.3436,
        description='A luxury boutique hotel in the heart of Lahore',
        room_count=24,
        category='5-Star',
        status='approved'
    )
    
    db.session.add(hotel)
    db.session.flush()  # Get hotel ID
    
    print("✅ Created sample hotel")
    
    # Create sample rooms
    rooms = [
        Room(
            hotel_id=hotel.id,
            category='Deluxe King',
            photos='["room1.jpg"]',
            amenities='["Wi-Fi", "AC", "Minibar", "City View"]',
            price=14200,
            total_units=8
        ),
        Room(
            hotel_id=hotel.id,
            category='Twin Standard',
            photos='["room2.jpg"]',
            amenities='["Wi-Fi", "AC"]',
            price=9600,
            total_units=10
        ),
        Room(
            hotel_id=hotel.id,
            category='Suite Ocean View',
            photos='["room3.jpg"]',
            amenities='["Wi-Fi", "AC", "Balcony", "Minibar"]',
            price=26800,
            total_units=6
        )
    ]
    
    for room in rooms:
        db.session.add(room)
    
    print("✅ Created sample rooms")
    
    # Create sample reviews
    reviews = [
        Review(
            hotel_id=hotel.id,
            guest_name='Hana Kobayashi',
            rating=5,
            comment='Amazing stay! The room was beautiful and staff was incredibly friendly.',
            created_at=datetime.utcnow()
        ),
        Review(
            hotel_id=hotel.id,
            guest_name='Marco Rossi',
            rating=4,
            comment='Great service and excellent breakfast. Would definitely stay again!',
            owner_reply='Thank you Marco! We look forward to welcoming you back.',
            created_at=datetime.utcnow()
        )
    ]
    
    for review in reviews:
        db.session.add(review)
    
    print("✅ Created sample reviews")
    
    # Commit all changes
    db.session.commit()
    print("🎉 Production database seeding completed successfully!")
    print(f"Admin login: admin@stayfolio.com / admin123")
    print(f"Owner login: owner@marlowhotel.com / owner123")

if __name__ == '__main__':
    # Set production config
    os.environ['FLASK_CONFIG'] = 'production'
    
    app = create_app('production')
    
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            print("✅ Database tables created")
            
            # Check if data already exists
            if User.query.first():
                print("⚠️  Database already has data. Skipping seeding.")
                print("If you want to reset, please drop and recreate the database.")
            else:
                seed_production_data()
                
        except Exception as e:
            print(f"❌ Error during seeding: {str(e)}")
            sys.exit(1)