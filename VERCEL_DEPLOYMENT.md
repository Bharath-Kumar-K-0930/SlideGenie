# Vercel Deployment Guide - SlideGenie AI

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy Frontend Only (Recommended)

Since Vercel has limitations with Python backends, we'll deploy:
- **Frontend on Vercel** (Next.js)
- **Backend on Render/Railway** (FastAPI)

### Step-by-Step Deployment

---

## 📦 Part 1: Deploy Backend (Render)

### 1. Go to Render.com
- Visit: https://render.com
- Sign up/Login with GitHub

### 2. Create New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository: `Bharath-Kumar-K-0930/SlideGenie`

### 3. Configure Backend
```
Name: slidegenie-backend
Region: Choose closest to you
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 4. Add Environment Variables
```
OPENAI_API_KEY=your_openai_key_here
PROJECT_NAME=SlideGenie AI
VERSION=1.0.0
API_V1_STR=/api/v1
BACKEND_CORS_ORIGINS=["https://your-frontend.vercel.app"]
```

### 5. Deploy
- Click "Create Web Service"
- Wait for deployment (~3-5 minutes)
- Copy your backend URL (e.g., `https://slidegenie-backend.onrender.com`)

---

## 🎨 Part 2: Deploy Frontend (Vercel)

### 1. Go to Vercel
- Visit: https://vercel.com
- Sign up/Login with GitHub

### 2. Import Project
- Click "Add New..." → "Project"
- Import `Bharath-Kumar-K-0930/SlideGenie`

### 3. Configure Frontend
```
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 4. Add Environment Variable
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```
⚠️ Replace with your actual Render backend URL!

### 5. Deploy
- Click "Deploy"
- Wait for deployment (~2-3 minutes)
- Your app will be live at `https://your-project.vercel.app`

---

## 🔧 Part 3: Update CORS Settings

After deploying, update backend CORS:

### Edit `backend/app/core/config.py`
```python
BACKEND_CORS_ORIGINS: list[str] = [
    "http://localhost:3000",
    "https://your-frontend.vercel.app",  # Add your Vercel URL
]
```

### Redeploy Backend
- Commit changes to GitHub
- Render will auto-deploy

---

## ✅ Verification Checklist

### Backend Health Check
```bash
curl https://your-backend.onrender.com/api/v1/health
```

Expected response:
```json
{
  "status": "active",
  "project": "SlideGenie AI",
  "version": "1.0.0"
}
```

### Frontend Check
- Visit your Vercel URL
- Try generating a presentation
- Check browser console for errors

---

## 🎯 Alternative: Vercel Monorepo (Advanced)

If you want both on Vercel:

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy
```bash
cd "d:\Projects\SlideGenie AI Project"
vercel
```

### 3. Follow Prompts
- Link to existing project or create new
- Set root directory to `frontend`
- Configure environment variables

---

## 📝 Environment Variables Summary

### Backend (Render)
```env
OPENAI_API_KEY=sk-proj-...
PROJECT_NAME=SlideGenie AI
VERSION=1.0.0
API_V1_STR=/api/v1
BACKEND_CORS_ORIGINS=["https://your-frontend.vercel.app"]
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

---

## 🐛 Troubleshooting

### Issue: CORS Error
**Solution**: Add your Vercel URL to `BACKEND_CORS_ORIGINS`

### Issue: API Not Found
**Solution**: Check `NEXT_PUBLIC_API_URL` is correct

### Issue: Backend Timeout
**Solution**: Render free tier sleeps after inactivity. Upgrade to paid tier.

### Issue: OpenAI Errors
**Solution**: Verify `OPENAI_API_KEY` is set correctly

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Vercel (Frontend) | Hobby | Free |
| Render (Backend) | Free | $0 |
| Render (Backend) | Starter | $7/month |
| OpenAI API | Pay-as-go | ~$2-10/month |

**Total**: $0-17/month

---

## 🔄 Continuous Deployment

Both Vercel and Render support auto-deployment:

1. Push to GitHub `main` branch
2. Vercel auto-deploys frontend
3. Render auto-deploys backend
4. Changes live in ~3-5 minutes

---

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor performance
- Check analytics

### Render Dashboard
- View backend logs
- Monitor resource usage
- Check uptime

---

## 🎉 You're Done!

Your SlideGenie AI app is now live:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

Share your live URL! 🚀

---

## 📞 Need Help?

1. Check deployment logs in Vercel/Render
2. Review CORS settings
3. Verify environment variables
4. Test health endpoints

**Happy Deploying!** 🎊
