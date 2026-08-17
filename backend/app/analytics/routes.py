from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Hotel, Booking, Review, User
from app.analytics import analytics_bp
from sqlalchemy import func, extract
from datetime import datetime, timedelta

@analytics_bp.route('/hotels/<int:hotel_id>', methods=['GET'])
@jwt_required()
def get_hotel_analytics(hotel_id):
    """Get analytics data for a specific hotel"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    hotel = Hotel.query.get_or_404(hotel_id)
    
    # Check permission - owner of hotel or admin
    if user.role != 'admin' and hotel.owner_id != user.id:
        return {'error': 'Access denied'}, 403
    
    # Date range for analytics
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=180)  # 6 months
    
    # Monthly revenue data
    monthly_revenue = db.session.query(
        extract('month', Booking.created_at).label('month'),
        func.sum(Booking.total_amount).label('revenue')
    ).filter(
        Booking.hotel_id == hotel_id,
        Booking.status == 'approved',
        Booking.created_at >= start_date
    ).group_by(extract('month', Booking.created_at)).all()
    
    # Booking counts by month
    monthly_bookings = db.session.query(
        extract('month', Booking.created_at).label('month'),
        func.count(Booking.id).label('bookings')
    ).filter(
        Booking.hotel_id == hotel_id,
        Booking.status == 'approved',
        Booking.created_at >= start_date
    ).group_by(extract('month', Booking.created_at)).all()
    
    # Current month stats
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    current_month_bookings = Booking.query.filter(
        Booking.hotel_id == hotel_id,
        Booking.status == 'approved',
        Booking.created_at >= current_month_start
    ).count()
    
    current_month_revenue = db.session.query(
        func.sum(Booking.total_amount)
    ).filter(
        Booking.hotel_id == hotel_id,
        Booking.status == 'approved',
        Booking.created_at >= current_month_start
    ).scalar() or 0
    
    # Average rating
    avg_rating = db.session.query(
        func.avg(Review.rating)
    ).filter(Review.hotel_id == hotel_id).scalar() or 0
    
    # Total reviews
    total_reviews = Review.query.filter_by(hotel_id=hotel_id).count()
    
    return {
        'hotel_id': hotel_id,
        'current_month': {
            'bookings': current_month_bookings,
            'revenue': float(current_month_revenue)
        },
        'monthly_revenue': [
            {'month': month, 'revenue': float(revenue or 0)} 
            for month, revenue in monthly_revenue
        ],
        'monthly_bookings': [
            {'month': month, 'bookings': bookings}
            for month, bookings in monthly_bookings
        ],
        'rating': {
            'average': round(float(avg_rating), 1) if avg_rating else 0,
            'total_reviews': total_reviews
        }
    }