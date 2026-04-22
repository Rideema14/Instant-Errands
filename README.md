# ⚡ QuickServe — Urgent Home Services Platform

Book trusted home service professionals within 30–60 minutes. Built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

---

## 🗂 Project Structure

```
quickserve/
├── frontend/                    # React + Vite app
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx              # Routes
│       ├── main.jsx
│       ├── index.css            # Global design system (CSS variables)
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ServiceCard.jsx
│       │   ├── ProviderCard.jsx
│       │   ├── AIChat.jsx       # AI assistant chat widget
│       │   └── LiveTracker.jsx  # Real-time booking tracker
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Services.jsx
│       │   ├── BookService.jsx
│       │   ├── Bookings.jsx
│       │   ├── BookingDetail.jsx
│       │   ├── Providers.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── Profile.jsx
│       ├── context/
│       │   └── AuthContext.jsx  # Auth state + JWT storage
│       ├── hooks/
│       │   └── useSocket.js     # Socket.io live tracking hooks
│       └── utils/
│           └── api.js           # Axios instance with auth interceptor
│
└── backend/                     # Node.js + Express API
    ├── server.js                # Entry point + Socket.io setup
    ├── package.json
    ├── .env.example
    ├── config/
    │   └── db.js                # MongoDB connection
    ├── models/
    │   ├── User.js
    │   ├── Provider.js
    │   ├── Service.js
    │   └── Booking.js
    ├── routes/
    │   ├── auth.js              # Register, login, profile
    │   ├── services.js          # CRUD + seed
    │   ├── providers.js         # List, match, review
    │   ├── bookings.js          # Create, track, rate
    │   └── ai.js                # Anthropic AI assistant proxy
    └── middleware/
        └── auth.js              # JWT protect + adminOnly
```

---

## 🚀 Getting Started

### 1. Clone & Setup

```bash
git clone <your-repo>
cd quickserve
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Anthropic API key
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**  
Backend runs on **http://localhost:5000**

---

## ⚙️ Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quickserve
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
ANTHROPIC_API_KEY=your_anthropic_key_here
```

---

## 🌱 Seed Services

After starting the backend, open:  
`POST http://localhost:5000/api/services/seed`

Or it auto-seeds on the Home page if no services exist.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT-based login/register with bcrypt |
| 🛎 Services | 8 categories, filterable, searchable |
| ⚡ AI Matching | Top-rated provider auto-matched on booking |
| 🤖 AI Assistant | Claude-powered chat to identify your problem |
| 📍 Live Tracking | Socket.io real-time status + location updates |
| 🎬 Video Previews | Provider video intro links |
| ⭐ Reviews | Rating + review system post-completion |
| 🔑 OTP Verification | 4-digit OTP for provider arrival confirmation |
| 📱 Responsive | Mobile-friendly dark UI |

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (🔒)
- `PUT /api/auth/me` — Update profile (🔒)

### Services
- `GET /api/services` — List all services
- `GET /api/services/:id` — Get one service
- `POST /api/services/seed` — Seed defaults

### Bookings
- `POST /api/bookings` — Create booking (🔒)
- `GET /api/bookings/my` — My bookings (🔒)
- `GET /api/bookings/:id` — Booking detail (🔒)
- `PUT /api/bookings/:id/status` — Update status (🔒)
- `POST /api/bookings/:id/rate` — Rate booking (🔒)

### Providers
- `GET /api/providers` — List available providers
- `GET /api/providers/match/:serviceId` — AI-matched providers
- `POST /api/providers/:id/review` — Add review (🔒)

### AI
- `POST /api/ai/chat` — Chat with QuickServe AI

### Socket Events
- `join_booking` — Join a booking room for live updates
- `update_location` — Emit provider location
- `provider_location` — Receive provider location
- `status_changed` — Booking status updated

---

## 🎨 Tech Stack

**Frontend:** React 18, Vite, React Router v6, Axios, Socket.io-client, Lucide React, Google Fonts (Syne + DM Sans)

**Backend:** Node.js, Express, MongoDB + Mongoose, Socket.io, JWT, bcryptjs

**AI:** Anthropic Claude (claude-sonnet-4-20250514) via REST API
