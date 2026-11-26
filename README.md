# Civic Pulse — Full-Stack Civic Infrastructure Platform

Civic Pulse is an intelligent full-stack civic reporting platform designed to tackle the urban water damage chain:
1. **Blocked Drainage / Flooding** (water pools on streets)
2. **Water Leakages** (pipe bursts saturate and soften road foundations)
3. **Potholes** (weakened asphalt breaks apart under vehicular traffic)

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React-Leaflet, Framer Motion
- **Backend:** Node.js, Express.js, REST APIs, Multer (multipart photo uploads), CORS
- **Database:** Supabase (PostgreSQL) + Automatic local persistent in-memory fallback store
- **AI Engine:** Civic Analysis Engine (severity classification, urgency scoring 1-100, compound water-chain risk prediction, and municipal action recommendation)

---

## 🚀 How to Run the Application

### Option A: Double-Click Launcher (Windows)
Double-click `start_app.bat` in this folder. It will launch both the backend and frontend servers in separate windows and open `http://localhost:5173` in your browser.

### Option B: From VS Code Terminal

#### 1. Start the Backend Server (Port 5000)
```bash
cd backend
npm start
```
*Backend runs at:* `http://localhost:5000`  
*API Base:* `http://localhost:5000/api`

#### 2. Start the Frontend Server (Port 5173)
In a new terminal window:
```bash
cd frontend
npm run dev
```
*Frontend runs at:* `http://localhost:5173`

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check & Supabase connection status |
| `GET` | `/api/reports` | Get all reports (supports query params: `?type=pothole&area=Andheri`) |
| `GET` | `/api/reports/:id` | Get details for a specific issue |
| `POST` | `/api/reports` | Submit a new issue (supports photo upload, GPS coordinates, auto AI analysis) |
| `PATCH` | `/api/reports/:id/status` | Update resolution status (`Reported`, `In progress`, `Fixed`) |
| `POST` | `/api/reports/:id/upvote` | Citizen upvoting to increase municipal priority |
| `GET` | `/api/stats` | Aggregated city statistics, area leaderboards, hotspots, and chain alerts |
| `POST` | `/api/ai/analyze` | Standalone AI evaluation of issue severity & municipal action |

---

## ⚡ How to Connect Supabase (Step-by-Step)

The application works **100% out of the box right now** using its built-in store. When you are ready to connect your live Supabase cloud database:

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and click **New Project**.
2. Name it `civic-pulse` and choose your region.

### Step 2: Run the Database Schema
1. In your Supabase dashboard, open the **SQL Editor** on the left menu.
2. Open the file `backend/supabase_schema.sql` in VS Code, copy all its contents, and paste it into the Supabase SQL Editor.
3. Click **Run**. This creates the `reports` table, security policies (RLS), and benchmark seed data.

### Step 3: Add Your API Keys to Backend
1. In Supabase, go to **Project Settings** (gear icon) ➔ **API**.
2. Copy your **Project URL** and **anon / public key**.
3. Open `backend/.env` and paste them:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```
4. Restart the backend (`npm start`). You will see:
   `✅ Supabase connected successfully to: https://your-project-id.supabase.co`

---

## 🤖 AI Features Included

1. **Automated Severity Scoring:** Evaluates reported descriptions and keywords to assign a tier (`low`, `medium`, `high`, `critical`) and urgency score (`1 - 100`).
2. **Water Chain Risk Prediction:** Detects whether an open drainage block or water leak is threatening nearby road structural integrity.
3. **Municipal Action Dispatch:** Recommends specific remediation equipment (e.g. suction trucks, cold-mix asphalt, valve isolation) and repair timeframes.
