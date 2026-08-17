# Hotel Management System - Deployment Guide

## 🚀 Deployment Overview
- **Frontend**: Vercel (React/Vite)
- **Backend**: Railway (Flask/Python)
- **Database**: Railway PostgreSQL

---

## 📋 Prerequisites
1. GitHub account
2. Vercel account (https://vercel.com)
3. Railway account (https://railway.app)

---

## 🛠️ Backend Deployment (Railway)

### Step 1: Prepare Repository
1. Commit all changes to GitHub
2. Push to your main branch

### Step 2: Deploy on Railway
1. Go to [Railway.app](https://railway.app)
2. Click "Start a New Project"
3. Connect your GitHub repository
4. Select the repository containing your hotel management system

### Step 3: Configure Railway
1. **Root Directory**: Set to `/backend` (important!)
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `python app.py`

### Step 4: Add Environment Variables
In Railway dashboard, add these variables:
```
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
PORT=5000
```

### Step 5: Add Database
1. In Railway dashboard, click "Add Service"
2. Select "PostgreSQL"
3. Railway will automatically provide DATABASE_URL

### Step 6: Initialize Database
After deployment, run these commands in Railway's terminal:
```bash
python
from app import app, db
with app.app_context():
    db.create_all()
    print("Database initialized!")
exit()

# Run seed data
python seed_data.py
```

### Step 7: Note Your Railway URL
- Your API will be available at: `https://your-app-name.railway.app`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Create Environment Variable
1. Create `.env.production` file in root directory:
```
VITE_API_URL=https://your-railway-app.railway.app
```

### Step 2: Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Click "Import Project"
3. Import from GitHub
4. Select your repository

### Step 3: Configure Vercel
1. **Framework**: Vite
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Root Directory**: Leave empty (root)

### Step 4: Add Environment Variable
In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://your-railway-app.railway.app`

### Step 5: Deploy
1. Click "Deploy"
2. Your frontend will be available at: `https://your-app.vercel.app`

---

## 🔧 Update CORS Settings

After deployment, update your Railway backend:

1. Add your Vercel URL to CORS origins in `backend/app/config.py`:
```python
# In ProductionConfig class
CORS_ORIGINS = [
    'https://your-app.vercel.app',
    'http://localhost:5173'  # Keep for local development
]
```

2. Redeploy the Railway app

---

## 🧪 Testing Deployment

### Backend Test
Visit: `https://your-railway-app.railway.app`
Should show: Flask API status

### Frontend Test
Visit: `https://your-app.vercel.app`

### Login Test
**Admin**: admin@stayfolio.com / admin123
**Owner**: owner@marlowhotel.com / owner123

---

## 🔄 Environment Files Summary

### Backend (.env for Railway)
```
FLASK_ENV=production
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-key
DATABASE_URL=postgresql://... (auto-provided by Railway)
PORT=5000
```

### Frontend (.env.production for Vercel)
```
VITE_API_URL=https://your-railway-app.railway.app
```

---

## 🚨 Important Notes

1. **Railway Root Directory**: Must be set to `/backend`
2. **CORS Configuration**: Update after getting Vercel URL
3. **Environment Variables**: Must be set in both platforms
4. **Database**: Initialize and seed after Railway deployment
5. **HTTPS**: Both platforms provide HTTPS automatically

---

## 🎯 Final URLs
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-railway-app.railway.app
- **Admin Panel**: https://your-app.vercel.app/admin
- **Owner Panel**: https://your-app.vercel.app/owner

Your hotel management system will be live and ready to use! 🎉