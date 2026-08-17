# 🐍 PythonAnywhere Deployment Guide

## Step 1: Create Free Account
1. Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. Sign up for **FREE** account
3. No credit card required!

## Step 2: Upload Your Code
1. Go to **Files** tab in PythonAnywhere dashboard
2. Create folder: `stayfolio`
3. Upload all files from your `backend/` folder
4. Or clone from GitHub:
   ```bash
   git clone https://github.com/yourusername/hotelManagementSystem.git
   ```

## Step 3: Install Dependencies
1. Open **Bash Console**
2. Navigate to your project:
   ```bash
   cd stayfolio
   pip3.10 install --user -r requirements.txt
   ```

## Step 4: Setup Database
1. Go to **Databases** tab
2. Create MySQL database: `yourusername$stayfolio`
3. Note the connection details
4. In Bash console:
   ```bash
   python3.10
   from app import create_app, db
   app = create_app('production')
   with app.app_context():
       db.create_all()
   exit()
   
   python3.10 production_seed.py
   ```

## Step 5: Create Web App
1. Go to **Web** tab
2. Click "Add a new web app"
3. Choose **Flask**
4. Python 3.10
5. Path: `/home/yourusername/stayfolio/app.py`

## Step 6: Configure WSGI
Edit the WSGI file with this content:
```python
import sys
import os

# Add your project directory to the Python path
path = '/home/yourusername/stayfolio'
if path not in sys.path:
    sys.path.append(path)

# Set environment variables
os.environ['FLASK_CONFIG'] = 'production'
os.environ['SECRET_KEY'] = 'your-secret-key-here'
os.environ['JWT_SECRET_KEY'] = 'your-jwt-key-here'
os.environ['DATABASE_URL'] = 'mysql://yourusername:password@yourusername.mysql.pythonanywhere-services.com/yourusername$stayfolio'

from app import create_app
application = create_app('production')
```

## Step 7: Set Environment Variables
In the Web tab, scroll to "Environment variables":
```
FLASK_CONFIG=production
SECRET_KEY=Stayfolio_2024_Secret_Key_123456789
JWT_SECRET_KEY=JWT_Stayfolio_2024_Token_987654321
```

## Step 8: Your API is Live!
- URL: `https://yourusername.pythonanywhere.com`
- Health check: `https://yourusername.pythonanywhere.com/health`

## ✅ Complete Setup Time: ~15 minutes
## 💰 Cost: $0.00 (Forever Free!)