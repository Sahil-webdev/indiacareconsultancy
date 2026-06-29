# India Care Consultancy — Monorepo

A full-stack healthcare platform built as a monorepo with 3 independent apps.

## 📁 Project Structure

```
icc/
├── client/      → Patient-facing website    (Next.js 16, React 19, TailwindCSS)
├── panel/       → Admin & Staff panel       (Next.js, Doctor / Hospital / Consultant dashboards)
└── backend/     → REST API server           (Node.js, Express.js, MongoDB / Mongoose)
```

---

## 🚀 Running Locally

### 1. Backend (Port 5000)
```bash
cd backend
cp .env.example .env      # Fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

### 2. Client / Website (Port 3000)
```bash
cd client
cp .env.local.example .env.local    # or create .env.local manually
npm install
npm run dev
```

### 3. Panel (Port 3001)
```bash
cd panel
npm install
npm run dev
```

---

## 🌐 URLs

| App | Dev URL | Production |
|---|---|---|
| Website | http://localhost:3000 | https://www.indiacareconsultancy.com |
| Panel | http://localhost:3001 | https://panel.indiacareconsultancy.com |
| Backend API | http://localhost:5000 | https://api.indiacareconsultancy.com |

---

## 🔑 Environment Variables

### `client/.env.local`
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PANEL_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### `panel/.env.local`
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PANEL_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### `backend/.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/icc
JWT_SECRET=your_strong_secret_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
NODE_ENV=development
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend (client) | Next.js 16, React 19, TailwindCSS 4, Framer Motion |
| Admin Panel | Next.js 16, React 19, TailwindCSS 4 |
| Backend API | Node.js, Express.js 4, JWT Auth |
| Database | MongoDB + Mongoose |
