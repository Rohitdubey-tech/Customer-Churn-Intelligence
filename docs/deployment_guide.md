# 🚀 Deployment Guide: Customer Churn Intelligence

This project contains a **React 18 + Tailwind CSS** frontend and a **Python (Flask + LightGBM + SHAP)** backend.

---

## 🌟 Option 1: Render.com (Recommended & 100% Free)

Render allows you to deploy both the Flask backend and React frontend directly from your GitHub repository: [`https://github.com/Rohitdubey-tech/Customer-Churn-Intelligence.git`](https://github.com/Rohitdubey-tech/Customer-Churn-Intelligence.git).

### Step-by-Step Render Deployment:

1. **Sign in to Render**: Go to [dashboard.render.com](https://dashboard.render.com) and log in with GitHub.
2. **New Blueprint / Web Services**:
   - Click **New +** -> **Blueprint**.
   - Connect your repository: `Rohitdubey-tech/Customer-Churn-Intelligence`.
   - Render will detect `render.yaml` automatically and prompt to create both services:
     1. **`customer-churn-backend`** (Python Web Service)
     2. **`customer-churn-frontend`** (Static Site)
3. **Manual Setup (If not using Blueprint)**:
   - **Backend Web Service**:
     - **Root Directory**: `backend`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 run:app`
     - **Environment Variable**: `PORT=5001`
   - **Frontend Static Site**:
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `frontend/dist`
     - **Rewrite Rule**: Redirect `/*` to `/index.html` for single page app routing.

---

## ⚡ Option 2: Vercel (Frontend) + Render / Railway (Backend)

### Frontend on Vercel:
1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Import repository `Customer-Churn-Intelligence`.
3. Set **Framework Preset**: `Vite`.
4. Set **Root Directory**: `./frontend`.
5. Click **Deploy**.

### Backend on Railway / Render:
1. Go to [railway.app](https://railway.app) or Render.
2. Deploy the `backend` folder as a Python web service.
3. Set Start Command: `gunicorn --bind 0.0.0.0:$PORT run:app`.

---

## 🐳 Option 3: Docker Deployment (Local or Server)

The project includes pre-configured Dockerfiles and `docker-compose.yml`.

To run locally or on a VPS (AWS EC2 / DigitalOcean / Linode):

```bash
# Clone the repository
git clone https://github.com/Rohitdubey-tech/Customer-Churn-Intelligence.git
cd Customer-Churn-Intelligence

# Build & launch containerized stack
docker-compose up --build -d
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5001/api/health`

---

## 📄 Repository Link
GitHub: [https://github.com/Rohitdubey-tech/Customer-Churn-Intelligence.git](https://github.com/Rohitdubey-tech/Customer-Churn-Intelligence.git)
