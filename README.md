# Streakly ⚡

A full-stack daily habit tracker. Log 9 habits, track streaks, and visualize your progress weekly, monthly, and yearly.

## Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Recharts
- **Backend**: Express.js REST API
- **Database**: MongoDB + Mongoose
- **Date handling**: dayjs

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017

### Backend

```bash
cd backend
npm install
npm run dev     
# or
node server.js
```

Runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`

## Habits Tracked

| ID | Name |
|----|------|
| gym | 🏋️ Gym / Workout |
| reading | 📚 Book Reading |
| company | 💼 Company Work |
| learning | 🧠 Learning / Courses |
| sideproject | 🚀 Side Projects |
| pixlreel | 🎬 Pixl AI Reel |
| kastreel | 🎬 Kast Reel |
| post | 📣 Post on X / LinkedIn |
| jobhunt | 💼 Job Hunt |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/logs/today` | Get today's log |
| PUT | `/api/logs/today` | Upsert today's log |
| GET | `/api/logs/week?start=YYYY-MM-DD` | Get 7-day log |
| GET | `/api/logs/month?year=YYYY&month=MM` | Get monthly logs |
| GET | `/api/logs/year?year=YYYY` | Get yearly summary |
| GET | `/api/analytics/summary` | Overall stats |

## Pages

- `/` — Today's dashboard with habit grid
- `/weekly` — Weekly table + bar chart
- `/monthly` — Calendar heatmap + per-habit bars
- `/yearly` — Line chart + consistency heatmap
- `/analytics` — Stats cards, trend chart, consistency table
