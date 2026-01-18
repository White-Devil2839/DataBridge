# DataBridge

A data orchestration platform that connects external APIs, normalizes messy JSON into clean structured data, and lets you track everything through a real-time dashboard.

I built this to solve a problem I kept running into: pulling data from multiple APIs, each with its own quirks, and making it usable without writing custom parsing logic every time.

---

## What It Does

**Connect** → Pick an API (or use a template), plug in your key, done.

**Sync** → Pull data manually or schedule it to run automatically.

**Normalize** → Flatten nested JSON into consistent, query-friendly rows.

**Export** → View it, filter it, or download as CSV.

---

## Quick Demo

Default accounts are pre-seeded for testing:

| Role  | Email                   | Password  |
|-------|-------------------------|-----------|
| Admin | admin@databridge.com    | admin123  |
| User  | user@databridge.com     | user123   |

Admin can manage shared connectors and view system health. Regular users can create personal connectors and track their own sync jobs.

---

## Features

- **API Templates** – Pre-configured connectors for CoinGecko, Alpha Vantage, NewsAPI, OpenWeather, and more. No docs needed.
- **Role-Based Access** – Admins see everything. Users see their own stuff. Clean separation.
- **Job History** – Every sync is logged. See what ran, when, and whether it worked.
- **Data Health** – At a glance: which connectors are stale, failing, or healthy.
- **CSV Export** – Download normalized data in one click.
- **Onboarding Tour** – New users get a guided walkthrough on first login.
- **Scalable Design** – Clear separation between ingestion, normalization, and presentation layers.

---

## Tech Stack

### Backend
- Node.js + Express
- Prisma ORM with MySQL
- JWT authentication
- Custom scheduler for background syncs (cron + job tracking)

### Frontend
- React 18 (Vite)
- Tailwind CSS v4
- Recharts for visualizations
- Context-based auth and tutorial state

---

## Setup

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

Create `backend/.env`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/databridge"
JWT_SECRET="pick-something-random"
PORT=3001
```

### 3. Initialize database

```bash
cd backend
npx prisma migrate dev --name init
npm run prisma:seed
```

### 4. Run locally

```bash
# Backend (terminal 1)
cd backend && npm run dev

# Frontend (terminal 2)
cd frontend && npm run dev
```

App runs at `http://localhost:5173`

---

## API Endpoints (Highlights)

| Method | Endpoint                        | What It Does                     |
|--------|---------------------------------|----------------------------------|
| GET    | /api/connectors/templates       | List available API templates     |
| POST   | /api/connectors/from-template   | Create connector from template   |
| POST   | /api/connectors/:id/sync        | Trigger manual sync              |
| GET    | /api/jobs                       | View sync job history            |
| POST   | /api/jobs/:id/retry             | Retry a failed job               |
| GET    | /api/data/normalized/export     | Export data as CSV               |
| GET    | /api/health                     | Check system status              |

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── routes/           # Express routes
│   │   ├── services/         # Scheduler, sync engine
│   │   └── middleware/       # Auth, validation
│   └── prisma/               # Schema and migrations
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   ├── context/          # Auth, Tutorial state
│   │   └── utils/            # Formatters, validators
│   └── public/
```

---

## Why I Built This

Most "connect to API" tutorials stop at fetching JSON. But in real projects, you need:

- Scheduled background syncs
- Error handling and retries
- A way to track what's stale
- Normalized output you can actually query

This project handles all of that. It's not just a dashboard—it's a working data pipeline.

---

## Who This Is For

- Developers who need to consume multiple external APIs reliably
- Teams that want clean, structured data without manual parsing
- Anyone building dashboards, analytics tools, or internal data pipelines

---

## License

ISC
