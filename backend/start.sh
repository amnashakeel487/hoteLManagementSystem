#!/bin/bash
set -e

echo "=== Starting Hotel Management API ==="

# Initialize DB tables (DATABASE_URL is available at runtime)
echo "Initializing database tables..."
python -c "
from app import create_app, db
app = create_app('production')
with app.app_context():
    db.create_all()
    print('DB tables ready.')
"

# Start production server
echo "Starting gunicorn..."
exec gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
