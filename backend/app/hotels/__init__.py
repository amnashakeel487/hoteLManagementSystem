from flask import Blueprint

hotels_bp = Blueprint('hotels', __name__)

from app.hotels import routes