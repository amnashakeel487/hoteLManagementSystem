#!/bin/bash
set -e

echo "=== Railway Startup ==="

# Initialize DB tables if not done
echo "Running database setup..."
python app.py db_init 2>/dev/null || python -c "
from app import create_app, db
app = create_app('production')
with app.app_context():
    db.create_all()
    print('DB tables ready.')
" 2>/dev/null || true

# Start the server
echo "Starting gunicorn..."
exec gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
