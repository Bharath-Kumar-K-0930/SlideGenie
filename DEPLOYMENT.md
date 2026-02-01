# Deployment Guide - SlideGenie AI

## 🚀 Deployment Architecture

```
Frontend (Vercel) → Backend (Render/Railway) → OpenAI API
```

## Backend Deployment (Render/Railway)

### Option 1: Render.com

1. **Create New Web Service**
   - Connect GitHub repository
   - Select `backend` as root directory
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables**
   ```
   OPENAI_API_KEY=sk-...
   PROJECT_NAME=SlideGenie AI
   VERSION=1.0.0
   API_V1_STR=/api/v1
   ```

3. **Instance Type**
   - Starter: Free tier (sufficient for MVP)
   - Standard: $7/month (recommended for production)

### Option 2: Railway.app

1. **Deploy from GitHub**
   - New Project → Deploy from GitHub
   - Select repository
   - Railway auto-detects Python

2. **Configure**
   - Root Directory: `backend`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables** (same as above)

## Frontend Deployment (Vercel)

### Steps

1. **Import Project**
   ```bash
   # From Vercel Dashboard
   - New Project → Import Git Repository
   - Select SlideGenie repository
   - Framework Preset: Next.js
   - Root Directory: frontend
   ```

2. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will auto-build and deploy

## Post-Deployment Configuration

### Update CORS Origins

In `backend/app/core/config.py`:
```python
BACKEND_CORS_ORIGINS: list[str] = [
    "http://localhost:3000",
    "https://your-frontend.vercel.app",  # Add your Vercel URL
]
```

### Update Frontend API URL

In `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

## Monitoring & Logging

### Backend Logs
- **Render**: Dashboard → Logs tab
- **Railway**: Project → Deployments → View Logs

### Key Metrics to Monitor
- Request duration (logged in ms)
- Error rates
- AI API usage (token consumption)
- Rate limit hits

### Log Format
```
2024-02-01 12:00:00 - slidegenie - INFO - API Request: /generate | Status: success | Duration: 2500.00ms
```

## Health Checks

### Backend Health Endpoint
```
GET https://your-backend.onrender.com/api/v1/health

Response:
{
  "status": "active",
  "project": "SlideGenie AI",
  "version": "1.0.0"
}
```

### Frontend Health
```
https://your-frontend.vercel.app
```

## Cost Estimation

### Infrastructure
- **Vercel**: Free (Hobby tier)
- **Render/Railway**: $0-7/month
- **Total**: ~$7/month

### OpenAI API
- GPT-3.5-turbo: ~$0.002 per request
- 1000 requests/month: ~$2
- **Total**: $2-10/month depending on usage

## Security Checklist

✅ API keys stored in environment variables  
✅ CORS configured for production domains  
✅ Rate limiting enabled (5 req/min)  
✅ Input validation (2000 char limit)  
✅ HTTPS enforced (automatic on Vercel/Render)  

## Deployment Checklist

- [ ] Backend deployed to Render/Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS origins updated
- [ ] Health checks passing
- [ ] Test generation with real API key
- [ ] Monitor logs for errors
- [ ] Update README with live URLs

## Rollback Plan

### Backend
1. Go to Render/Railway dashboard
2. Select previous deployment
3. Click "Redeploy"

### Frontend
1. Go to Vercel dashboard
2. Deployments → Select previous deployment
3. Click "Promote to Production"

## Support & Maintenance

### Weekly Tasks
- Check error logs
- Monitor API costs
- Review rate limit hits

### Monthly Tasks
- Update dependencies
- Review security patches
- Analyze usage patterns
