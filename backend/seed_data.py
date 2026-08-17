from app import create_app, db
from app.models import User, Hotel, Room, Booking, Review, CleaningRequest
from datetime import datetime, timedelta, date
import json

def seed_database():
    """Seed the database with initial data"""
    
    # Create admin user
    admin = User(email='admin@stayfolio.com', role='admin')
    admin.set_password('admin123')
    db.session.add(admin)
    
    # Create hotel owner
    owner1 = User(email='owner@marlowhotel.com', role='hotel_owner')
    owner1.set_password('owner123')
    db.session.add(owner1)
    
    # Create customer
    customer = User(email='customer@example.com', role='customer')
    customer.set_password('customer123')
    db.session.add(customer)
    
    db.session.flush()  # Get IDs
    
    # Create approved hotel
    approved_hotel = Hotel(
        owner_id=owner1.id,
        name='The Marlow Hotel',
        business_name='Marlow Hospitality Ltd',
        email='owner@marlowhotel.com',
        phone='+92 300 1234567',
        address='123 Main Street, Gulberg II',
        city='Lahore',
        country='Pakistan',
        latitude=31.7419,
        longitude=74.2630,
        description='A luxury 5-star hotel in the heart of Lahore offering world-class amenities and service.',
        room_count=24,
        category='5-Star',
        status='approved',
        logo_path='hotels/logo/marlow_logo.jpg',
        cover_path='hotels/cover/marlow_cover.jpg'
    )
    db.session.add(approved_hotel)
    
    # Create pending hotel
    pending_owner = User(email='pending@coralbayvillas.com', role='hotel_owner')
    pending_owner.set_password('pending123')
    db.session.add(pending_owner)
    db.session.flush()
    
    pending_hotel = Hotel(
        owner_id=pending_owner.id,  # Assign the owner
        name='Coral Bay Villas',
        business_name='Coral Bay Resort Ltd',
        email='info@coralbayvillas.com',
        phone='+255 123 456789',
        address='Beach Road, Stone Town',
        city='Zanzibar',
        country='Tanzania',
        latitude=-6.1659,
        longitude=39.2026,
        description='Boutique beachfront villas with stunning ocean views and traditional Swahili architecture.',
        room_count=12,
        category='Boutique',
        status='pending',
        license_path='hotels/license/coral_license.pdf',
        id_doc_path='hotels/cnic/coral_id.jpg'
    )
    db.session.add(pending_hotel)
    
    # Create rejected hotel
    rejected_owner = User(email='rejected@palmcourt.com', role='hotel_owner')
    rejected_owner.set_password('rejected123')
    db.session.add(rejected_owner)
    db.session.flush()
    
    rejected_hotel = Hotel(
        owner_id=rejected_owner.id,  # Assign the owner
        name='Palm Court Suites', 
        business_name='Palm Hospitality',
        email='info@palmcourt.com',
        phone='+90 212 555 0123',
        address='Sultanahmet Square',
        city='Istanbul',
        country='Turkey',
        latitude=41.0082,
        longitude=28.9784,
        description='Modern suites in historic Istanbul.',
        room_count=18,
        category='4-Star',
        status='rejected',
        rejection_reason='Business license document is unreadable. Please upload a clearer copy of your business registration.'
    )
    db.session.add(rejected_hotel)
    
    db.session.flush()  # Get hotel IDs
    
    # Create room categories for approved hotel
    deluxe_king = Room(
        hotel_id=approved_hotel.id,
        category='Deluxe King',
        price=142.00,
        total_units=8,
        amenities=json.dumps(['Wi-Fi', 'AC', 'Minibar', 'Room Service', 'Safe']),
        photos=json.dumps(['rooms/deluxe_king_1.jpg', 'rooms/deluxe_king_2.jpg'])
    )
    db.session.add(deluxe_king)
    
    twin_standard = Room(
        hotel_id=approved_hotel.id,
        category='Twin Standard',
        price=96.00,
        total_units=10,
        amenities=json.dumps(['Wi-Fi', 'AC', 'Room Service']),
        photos=json.dumps(['rooms/twin_standard_1.jpg'])
    )
    db.session.add(twin_standard)
    
    suite_ocean = Room(
        hotel_id=approved_hotel.id,
        category='Suite Ocean View',
        price=268.00,
        total_units=6,
        amenities=json.dumps(['Wi-Fi', 'AC', 'Balcony', 'Minibar', 'Room Service', 'Safe', 'Jacuzzi']),
        photos=json.dumps(['rooms/suite_ocean_1.jpg', 'rooms/suite_ocean_2.jpg', 'rooms/suite_ocean_3.jpg'])
    )
    db.session.add(suite_ocean)
    
    db.session.flush()  # Get room IDs
    
    # Create sample bookings
    bookings_data = [
        {
            'room_id': deluxe_king.id,
            'guest_name': 'Hana Kobayashi',
            'guest_email': 'hana@example.com',
            'check_in': date.today() + timedelta(days=5),
            'check_out': date.today() + timedelta(days=8),
            'status': 'pending',
            'total_amount': 426.00
        },
        {
            'room_id': twin_standard.id,
            'guest_name': 'Marco Rossi',
            'guest_email': 'marco@example.com',
            'check_in': date.today() + timedelta(days=7),
            'check_out': date.today() + timedelta(days=9),
            'status': 'pending',
            'total_amount': 192.00
        },
        {
            'room_id': suite_ocean.id,
            'guest_name': 'Sara Ahmed',
            'guest_email': 'sara@example.com',
            'check_in': date.today() - timedelta(days=3),
            'check_out': date.today(),
            'status': 'approved',
            'total_amount': 804.00
        },
        {
            'room_id': deluxe_king.id,
            'guest_name': "Liam O'Connor",
            'guest_email': 'liam@example.com',
            'check_in': date.today() - timedelta(days=10),
            'check_out': date.today() - timedelta(days=8),
            'status': 'approved',
            'total_amount': 284.00
        }
    ]
    
    for booking_data in bookings_data:
        booking = Booking(
            hotel_id=approved_hotel.id,
            **booking_data
        )
        db.session.add(booking)
    
    # Create sample reviews
    reviews_data = [
        {
            'hotel_id': approved_hotel.id,
            'guest_name': 'Hana Kobayashi',
            'rating': 5,
            'comment': 'Room was spotless and the view from the Deluxe King was unbeatable. Would book again.',
            'created_at': datetime.utcnow() - timedelta(days=1)
        },
        {
            'hotel_id': approved_hotel.id,
            'guest_name': 'Marco Rossi', 
            'rating': 4,
            'comment': 'Great location, breakfast could use more variety.',
            'created_at': datetime.utcnow() - timedelta(days=3)
        },
        {
            'hotel_id': approved_hotel.id,
            'guest_name': 'Elena Rodriguez',
            'rating': 5,
            'comment': 'Excellent service and beautiful hotel. The staff went above and beyond.',
            'created_at': datetime.utcnow() - timedelta(days=5)
        }
    ]
    
    for review_data in reviews_data:
        review = Review(**review_data)
        db.session.add(review)
    
    # Create sample cleaning request
    cleaning_request = CleaningRequest(
        hotel_id=approved_hotel.id,
        status='requested',
        created_at=datetime.utcnow() - timedelta(hours=2)
    )
    db.session.add(cleaning_request)
    
    # Commit all changes
    db.session.commit()
    
    print("Database seeded successfully!")
    print("\n=== Login Credentials ===")
    print("Admin: admin@stayfolio.com / admin123")
    print("Hotel Owner: owner@marlowhotel.com / owner123")
    print("Customer: customer@example.com / customer123")
    print("\n=== Test Data ===")
    print(f"✅ Approved Hotel: {approved_hotel.name} (ID: {approved_hotel.id})")
    print(f"⏳ Pending Hotel: {pending_hotel.name} (ID: {pending_hotel.id})")
    print(f"❌ Rejected Hotel: {rejected_hotel.name} (ID: {rejected_hotel.id})")
    print(f"📋 Bookings: {len(bookings_data)} created")
    print(f"⭐ Reviews: {len(reviews_data)} created")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
        seed_database()