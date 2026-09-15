# FurShield 🐾

**FurShield** is a full-stack MERN (MongoDB, Express, React, Node.js) pet care management platform connecting pet owners, veterinarians, and animal shelters.

---

## ✨ Features

### 🐾 Pet Owners
- **My Pets** — Add, edit, and delete pet profiles (species, breed, allergies, photos)
- **Health Records** — Visual timeline of vet visits, prescriptions, vaccinations, lab results, and follow-up dates
- **Appointments** — Book appointments through a 4-step wizard: pet → vet search → slot picker → details/confirm
- **Shop** — Browse and cart products (food, medicine, accessories); place orders (no payment gateway)
- **Adoption Center** — Browse available pets and submit adoption interest forms
- **Care Tips** — Read articles and watch videos curated by vets and shelters

### 🩺 Veterinarians
- **Full appointment management** — Confirm, complete, and reschedule appointments with notes
- **Patient records** — View health records for their patients
- **Profile** — Manage specialization, clinic details, and available time slots

### 🏠 Shelters
- **Listing management** — Create, edit, and remove adoption listings
- **Adoption requests** — Review and approve/reject interest submissions

### 🔒 Security (Production)
- `helmet` — HTTP security headers
- `express-rate-limit` — 200 req/15 min general + 20 req/15 min on auth endpoints
- `morgan` — HTTP request logging (`combined` in production, `dev` in development)
- `compression` — Gzip response compression
- JWT authentication with 7-day expiry
- RBAC middleware on all protected endpoints

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS        |
| Backend   | Node.js, Express 5, ES Modules      |
| Database  | MongoDB (Mongoose ODM)              |
| Auth      | JWT (Bearer token) + localStorage   |
| Security  | Helmet, express-rate-limit, CORS    |

---

## 📁 Project Structure

```
FurShield/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── api/            # Axios service modules (one per resource)
│       ├── components/     # Reusable UI + feature components
│       │   ├── appointments/
│       │   ├── health/
│       │   ├── layout/     # DashboardLayout (sidebar)
│       │   ├── pets/
│       │   ├── routing/    # ProtectedRoute, PublicRoute
│       │   └── ui/         # Modal, etc.
│       ├── context/        # AuthContext (JWT + user state)
│       ├── hooks/          # Custom hooks per domain
│       └── pages/          # Page components (one folder per feature)
│
└── server/                 # Express backend
    ├── controllers/        # Business logic (12 resources)
    ├── middleware/         # auth, RBAC, errorHandler
    ├── models/             # Mongoose schemas (12 models)
    ├── routes/             # Express routers
    └── utils/              # AppError, sendResponse
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Environment Variables

**`server/.env`**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/furshield
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 📌 Constraints (per SRS §1.5)
- ❌ No payment gateway integration
- ❌ No veterinarian credential verification
- ✅ All financial flows are order-placement only (COD / in-person)

---

## 📄 License
For academic / demonstration purposes only.
