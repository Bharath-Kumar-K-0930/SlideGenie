# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Setup Complete

Your project is now **ready for Vercel deployment**! Here's what was configured:

### Files Created/Updated:
- ✅ `vercel.json` - Vercel configuration
- ✅ `VERCEL_DEPLOYMENT.md` - Detailed deployment guide
- ✅ `frontend/.env.example` - Environment variable template
- ✅ `backend/app/main.py` - CORS configured for Vercel
- ✅ `backend/app/core/config.py` - Vercel origins allowed

---

## 📋 Deployment Steps

### Step 1: Deploy Backend (Render) - 5 minutes

1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Select repository: `Bharath-Kumar-K-0930/SlideGenie`
5. Configure:
   ```
   Name: slidegenie-backend
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. Add Environment Variables:
   ```
   OPENAI_API_KEY=your_key_here
   PROJECT_NAME=SlideGenie AI
   VERSION=1.0.0
   API_V1_STR=/api/v1
   ```
7. Click "Create Web Service"
8. **Copy your backend URL** (e.g., `https://slidegenie-backend.onrender.com`)

### Step 2: Deploy Frontend (Vercel) - 3 minutes

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import: `Bharath-Kumar-K-0930/SlideGenie`
5. Configure:
   ```
   Framework: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   ```
6. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   ```
   ⚠️ Use your actual Render URL from Step 1!
7. Click "Deploy"

### Step 3: Test Your Deployment

1. Visit your Vercel URL
2. Try generating a presentation
3. Check if download works

---

## 🔧 CORS Configuration (Already Done!)

Your backend now automatically accepts requests from:
- ✅ All Vercel deployments (`*.vercel.app`)
- ✅ Localhost (for development)

No manual CORS configuration needed! 🎉

---

## 📝 Environment Variables Summary

### Backend (Render)
```env
OPENAI_API_KEY=sk-proj-...           # Get from OpenAI
PROJECT_NAME=SlideGenie AI
VERSION=1.0.0
API_V1_STR=/api/v1
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

---

## 🎯 Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **OpenAI API Keys**: https://platform.openai.com/api-keys
- **Full Guide**: See `VERCEL_DEPLOYMENT.md`

---

## 💰 Cost

- Vercel Frontend: **FREE** (Hobby tier)
- Render Backend: **FREE** (with sleep) or **$7/month** (always on)
- OpenAI API: **~$2-10/month** (pay-as-you-go)

**Total**: $0-17/month

---

## 🐛 Common Issues

### Issue: "API not found"
**Fix**: Check `NEXT_PUBLIC_API_URL` in Vercel environment variables

### Issue: "CORS error"
**Fix**: Already configured! Should work automatically.

### Issue: "Backend sleeping"
**Fix**: Render free tier sleeps after 15 min. Upgrade to $7/month for always-on.

---

## ✅ You're Ready!

Everything is configured. Just follow the 3 steps above and you'll be live in ~10 minutes! 🚀

**Need help?** Check `VERCEL_DEPLOYMENT.md` for detailed instructions.
