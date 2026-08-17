from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Review, Hotel, User
from app.reviews import reviews_bp

@reviews_bp.route('/<int:review_id>/reply', methods=['POST'])
@jwt_required()
def reply_to_review(review_id):
    """Hotel owner replies to a review"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    review = Review.query.get_or_404(review_id)
    
    # Check permission - owner of hotel or admin
    if user.role != 'admin' and review.hotel.owner_id != user.id:
        return {'error': 'Access denied'}, 403
    
    data = request.get_json()
    reply = data.get('reply', '').strip()
    
    if not reply:
        return {'error': 'Reply text is required'}, 400
    
    if review.owner_reply:
        return {'error': 'Review already has a reply'}, 400
    
    review.owner_reply = reply
    db.session.commit()
    
    return {
        'message': 'Reply added successfully',
        'review': review.to_dict()
    }