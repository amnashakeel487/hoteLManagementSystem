# � Quick Deployment Guide

## Step-by-Step Process

### 1️⃣ **Commit to GitHub**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2️⃣ **Deploy Backend (Railway)**
1. Go to [Railway.app](https://railway.app) → Sign in
2. "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **IMPORTANT**: Set Root Directory to `/backend`
5. Add PostgreSQL service
6. Add environment variables:
   ```
   FLASK_CONFIG=production
   FLASK_ENV=production
   SECRET_KEY=your-secret-key-123
   JWT_SECRET_KEY=your-jwt-key-456
   ```
7. Deploy & get your Railway URL

### 3️⃣ **Initialize Database**
In Railway console, run:
```bash
python production_seed.py
```

### 4️⃣ **Deploy Frontend (Vercel)**
1. Go to [Vercel.com](https://vercel.com) → Sign in
2. "Import Project" from GitHub
3. Select your repository
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-app.railway.app
   ```
5. Deploy & get your Vercel URL

### 5️⃣ **Update CORS**
In Railway, add environment variable:
```
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

### 6️⃣ **Test Your App**
- Frontend: `https://your-app.vercel.app`
- Admin: `admin@stayfolio.com` / `admin123`
- Owner: `owner@marlowhotel.com` / `owner123`

## ✅ You're Live!
Your hotel management system is now deployed and ready to use! 🎉

## 📞 Support
If you encounter issues, check:
1. Railway logs for backend errors
2. Vercel function logs for frontend issues
3. Environment variables are set correctly
4. Database is initialized with seed data

---
*Total deployment time: ~15 minutes* ⏱️