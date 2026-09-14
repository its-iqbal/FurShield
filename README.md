# 🐾 FurShield

> The all-in-one platform to manage your pet's insurance, health records, and vet care.

## Project Structure

```
FurShield/
├── client/          # React + Vite + Tailwind CSS frontend
├── server/          # Node.js + Express + MongoDB backend
├── package.json     # Root scripts (concurrently)
└── README.md
```

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS v3    |
| Backend   | Node.js, Express 4, Mongoose       |
| Database  | MongoDB                            |
| Dev Tools | concurrently, nodemon              |

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or [Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Install Dependencies

```bash
# Install all (root + server + client)
npm run install:all
```

Or individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `.env` and set your `MONGO_URI`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/furshield
# For Atlas: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/furshield
```

### 3. Run in Development

```bash
# From the root — starts both server and client simultaneously
npm run dev
```

Or separately:
```bash
npm run server   # Express API on http://localhost:5000
npm run client   # Vite dev server on http://localhost:5173
```

## API Endpoints

| Method | Path             | Description                    |
|--------|------------------|--------------------------------|
| GET    | `/`              | API health check               |
| GET    | `/api/v1/status` | Server + DB connection status  |

## License
MIT
