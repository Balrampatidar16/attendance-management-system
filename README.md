# Attendance Management System

A MERN-stack app to track employee attendance using live selfie + geolocation, with separate dashboards for Employee, Manager, and Admin, plus an overtime approval workflow.

**Live demo:** https://attendance-management-system-nine-tan.vercel.app/login

---

## 1. Quick Start

You need two things running at once: the **backend** (API) and the **frontend** (website). Open two terminals.

### Terminal 1 — Backend

```bash
cd backend
npm install
copy .env.example .env      # Windows (use `cp` on Mac/Linux)
```

Now open `backend/.env` and fill in the values — see [section 2](#2-what-you-need-to-add-env-variables) below.

```bash
npm run dev
Backend runs at http://localhost:5000. Check it worked by opening http://localhost:5000/api/v1/health — it should return { success: true }.

Backend runs at `http://localhost:5000`. Check it worked by opening `http://localhost:5000/api/v1/health` — it should return `{ success: true }`.

### Terminal 2 — Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
Frontend runs at http://localhost:5173.

Frontend runs at `http://localhost:5173`.

### (Optional) Load demo data

```bash
cd backend
npm run seed
```

This wipes and repopulates the database with 1 admin, 2 managers, 6 employees, and ~30 days of sample attendance. Login credentials are printed in the terminal and also listed in [section 5](#5-demo-login-credentials).

---

## 2. What You Need to Add (env variables)

The `.env.example` files are already in the repo — copy each to `.env` and fill in the blanks below. Nothing else needs to change to run it locally.

### `backend/.env`

| Variable | Required? | Where to get it |
|---|---|---|
| `MONGO_URI` | ✅ Required | MongoDB Atlas → Connect → Drivers (or a local MongoDB URL) |
| `ACCESS_TOKEN_SECRET` | ✅ Required | Any random long string, e.g. run `openssl rand -hex 32` |
| `REFRESH_TOKEN_SECRET` | ✅ Required | Same as above — use a **different** random string |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | ✅ Required (for selfie upload) | Free account at cloudinary.com → Dashboard |
| `GOOGLE_CLIENT_ID` | Optional | Only needed if you want "Sign in with Google" — Google Cloud Console → Credentials |
| `CORS_ORIGIN` | ✅ Required | Your frontend URL — `http://localhost:5173` locally, or your deployed Vercel URL in production |
| Everything else (`PORT`, `STANDARD_SHIFT_HOURS`, `GEOFENCE_*`, `LOG_LEVEL`) | Optional | Already has working defaults |

### `frontend/.env`

| Variable | Required? | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ Required | Points to your backend, e.g. `http://localhost:5000/api/v1` |
| `VITE_APP_NAME` | Optional | Just the app title shown in the UI |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Same Google Client ID as backend, only if using Google login |

**Without Cloudinary keys, punch-in/out selfie upload will fail** — that's the one piece you can't skip.

---

## 3. Tech Stack

- **Frontend** — React 18, Vite, Redux Toolkit + RTK Query, React Router v6, Tailwind CSS, Socket.IO client
- **Backend** — Node.js, Express, MongoDB (Mongoose), JWT auth, Zod validation, Winston + Morgan logging, Socket.IO
- **Other services** — Cloudinary (selfie storage), OpenStreetMap Nominatim (reverse geocoding for punch location)

---

## 4. Features

**Core**
- Login/signup with role-based access (Employee / Manager / Admin), protected on both frontend and backend
- Punch in / punch out with a live camera selfie (no file upload) and GPS location
- Automatic working-hours calculation → Completed (≥8h) / Incomplete (<8h)
- Overtime request → Manager/Admin approves or rejects
- Role-specific dashboards
- Manager/Admin can view selfies, mark attendance Valid/Invalid, and add remarks
- Daily & date-range reports, exportable as Excel and PDF, scoped by role

**Extras included**
- Real-time notifications (Socket.IO) for overtime decisions and verification results
- Geofencing (optional, off by default) — restrict punch-in to within a set radius of the office
- Dark mode
- Filters, pagination, search on all list views

**Not implemented**
- Missed-punch alerts (would need a scheduled/cron job — out of scope for now)

---

## 5. Demo Login Credentials

Run `npm run seed` first (see [section 1](#1-quick-start)). All accounts use the same password.

| Role | Email | Password |
|---|---|---|
| Admin | admin@attendance.test | `Passw0rd!123` |
| Manager | manager1@attendance.test | `Passw0rd!123` |
| Manager | manager2@attendance.test | `Passw0rd!123` |
| Employee | employee1@attendance.test | `Passw0rd!123` |
| Employee | employee2@attendance.test | `Passw0rd!123` |

(4 more employees are seeded too — `employee3` through `employee6`, same password.)

---

## 6. Project Structure

```
fullweb/
├── backend/     # Express API (controllers, models, routes, services)
└── frontend/    # React app (pages, components, redux store)
```

---

## 7. How It Works (short version)

Every request goes through security middleware (helmet, CORS, rate limiting) → JWT auth check → role check → validation → controller → database. Who can see what data (own / team / everyone) is decided in one shared place (`scope.service.js`), reused by attendance, overtime, and reports — so the rules stay consistent everywhere instead of being repeated per route.

Full API route list is in `backend/api.http` (with runnable sample requests).

---

## 8. Deploying It Yourself

- **Backend → Render**: New Web Service → root directory `backend` → build `npm install` → start `npm start` → copy all variables from `backend/.env.example` into Render's environment settings.
- **Frontend → Vercel**: New Project → root directory `frontend` → framework Vite → add `VITE_API_BASE_URL` pointing to your Render backend.
- After deploying, update `CORS_ORIGIN` (backend) and `VITE_API_BASE_URL` (frontend) to point at each other's live URLs.
- Camera & location only work over HTTPS in production — both Render and Vercel provide this by default, so no extra setup needed.
- MongoDB Atlas: whitelist `0.0.0.0/0` in Network Access so Render can connect (its IPs aren't fixed on the free tier).

---

## 9. Assumptions Made

- Report export (Excel/PDF) was listed as a "bonus" feature in the brief but was built anyway, after the core flow.
- New signups default to the `employee` role with no manager — an Admin assigns their manager later from the Users page.
- Geofencing is off by default so local testing and demo data aren't blocked by real office coordinates.
- Missed-punch alerts were skipped — they need a scheduled job, which is a different piece of infrastructure than the rest of the notification system (which is fully built).
