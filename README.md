# FurShield 🐾

**FurShield** is a full-stack MERN (MongoDB, Express, React, Node.js) pet care management platform connecting pet owners, veterinarians, and animal shelters.

---

## ✨ Features

### 🐾 Pet Owners
- **My Pets** — Add, edit, and delete pet profiles (species, breed, allergies, photos with live preview & presets)
- **Health Records** — Visual timeline of vet visits, prescriptions, vaccinations, lab results, and follow-up dates
- **Appointments** — Book appointments through an interactive 4-step wizard: pet → vet search → slot picker → details/confirm
- **Shop** — Browse products (food, medicine, accessories), add to cart, and checkout with full delivery address validation
- **Adoption Center** — Browse available rescue pets and submit adoption interest questionnaires
- **Care Tips** — Read articles and guides curated by veterinarians and shelters

### 🩺 Veterinarians
- **Appointment Management** — View appointment queues, confirm, reschedule, and complete appointments with medical notes
- **Patient Records** — Access medical records and health history for patient animals
- **Profile & Schedule** — Manage clinical specializations, address, and weekly available time slots

### 🏠 Shelters
- **Listing Management** — Publish, update, and manage rescue pet profiles with adoption statuses and photos
- **Adoption Requests** — Review applicant profiles, questionnaires, living spaces, and approve or decline requests

### 🔒 Security & Architecture
- `helmet` — HTTP security headers
- `express-rate-limit` — 200 req/15 min general + 20 req/15 min on auth endpoints
- `morgan` — HTTP request logging (`combined` in production, `dev` in development)
- `compression` — Gzip response compression
- JWT authentication with 7-day expiry and RBAC middleware on all protected routes
- Professional client-side input validation and error feedback across every form

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS        |
| Backend   | Node.js, Express, ES Modules        |
| Database  | MongoDB Atlas / Mongoose ODM        |
| Auth      | JWT (Bearer token) + localStorage   |
| Security  | Helmet, express-rate-limit, CORS    |

---

## 📁 Project Structure

```text
FurShield/
├── client/                 # React frontend (Vite)
│   ├── vercel.json         # Vercel SPA routing configuration
│   └── src/
│       ├── api/            # Axios service modules (one per resource)
│       ├── components/     # Reusable UI + feature components
│       │   ├── appointments/
│       │   ├── health/
│       │   ├── layout/     # Unified DashboardLayout (sidebar + topbar)
│       │   ├── pets/
│       │   ├── routing/    # ProtectedRoute, PublicRoute
│       │   └── ui/         # Modal, buttons, inputs
│       ├── context/        # AuthContext (JWT + user state)
│       ├── hooks/          # Custom hooks per domain
│       └── pages/          # Page components (Owner, Vet, Shelter, Shop, Adopt)
│
└── server/                 # Express backend
    ├── controllers/        # Business logic & request handling
    ├── middleware/         # auth, RBAC, errorHandler
    ├── models/             # Mongoose schemas (User, Pet, HealthRecord, etc.)
    ├── routes/             # Express REST API routes
    ├── scripts/            # Database seed script
    └── utils/              # AppError, sendResponse, asyncHandler
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster)

---

### Backend Setup

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. *(Optional)* Seed initial demo data:
   ```bash
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
   *(Server starts at `http://localhost:5000`)*

---

### Frontend Setup

1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(Frontend runs at `http://localhost:5173`)*

---

## ⚙️ Environment Variables

### `server/.env`
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/furshield?retryWrites=true&w=majority
```

---

## 🔑 Demo Credentials

Run `npm run seed` inside `server/` at any time to re-populate these test accounts.

| Role | Name | Email | Password | Landing Route |
|---|---|---|---|---|
| **Pet Owner** | Aryan Mehta | `owner@furshield.dev` | `Owner@1234` | `/dashboard` |
| **Veterinarian** | Dr. Priya Sharma | `vet@furshield.dev` | `Vet@1234` | `/vet/dashboard` |
| **Shelter** | Happy Paws Shelter | `shelter@furshield.dev` | `Shelter@1234` | `/shelter/dashboard` |

---

## ☁️ Deployment (Vercel & Railway)

- **Frontend (Vercel)**:
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://<your-railway-app>.up.railway.app/api/v1`
  - [client/vercel.json](file:///d:/FurShield/client/vercel.json) handles client-side SPA routing.

- **Backend (Railway)**:
  - Root directory: `server`
  - Start command: `npm start`
  - Set environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, etc.)
  - Ensure MongoDB Atlas allows `0.0.0.0/0` under Network Access.

---

## 📌 Constraints (per SRS §1.5)
- ❌ No payment gateway integration (Cash on Delivery / In-person order placement only)
- ❌ No external veterinarian licensing verification API
- ✅ All financial flows stop at order creation per academic project requirements

---

## 📄 License
For academic and demonstration purposes only.