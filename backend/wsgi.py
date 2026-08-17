import os
from app import create_app, db
from app.models import User
from production_seed import seed_production_data

config_name = os.environ.get('FLASK_CONFIG', 'production')
app = create_app(config_name)

# Ensure database tables exist and initial users are seeded
with app.app_context():
    try:
        db.create_all()
        # Drop NOT NULL constraint on owner_id in PostgreSQL if it was created previously
        try:
            with db.engine.connect() as conn:
                conn.execute(db.text("ALTER TABLE hotel ALTER COLUMN owner_id DROP NOT NULL;"))
                conn.commit()
                print("✅ Set hotel.owner_id to nullable in database.")
        except Exception as alter_err:
            pass

        if not User.query.first():
            print("🌱 Empty database detected - auto seeding initial data...")
            seed_production_data()
            print("✅ Initial data seeded successfully!")
        else:
            print("✅ Database already initialized with users.")
    except Exception as e:
        print(f"⚠️ Startup database check notice: {e}")

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0", port=port)

