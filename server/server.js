import express       from 'express';
import mongoose      from 'mongoose';
import cors          from 'cors';
import dotenv        from 'dotenv';
import cookieParser  from 'cookie-parser';
import helmet        from 'helmet';
import morgan        from 'morgan';
import compression   from 'compression';
import rateLimit     from 'express-rate-limit';

// ── Route imports ─────────────────────────────────────────────────────────────
import authRoutes             from './routes/authRoutes.js';
import userRoutes             from './routes/userRoutes.js';
import petRoutes              from './routes/petRoutes.js';
import healthRecordRoutes     from './routes/healthRecordRoutes.js';
import appointmentRoutes      from './routes/appointmentRoutes.js';
import productRoutes          from './routes/productRoutes.js';
import orderRoutes            from './routes/orderRoutes.js';
import adoptionListingRoutes  from './routes/adoptionListingRoutes.js';
import adoptionInterestRoutes from './routes/adoptionInterestRoutes.js';
import reviewRoutes           from './routes/reviewRoutes.js';
import notificationRoutes     from './routes/notificationRoutes.js';
import careArticleRoutes      from './routes/careArticleRoutes.js';

import errorHandler from './middleware/errorHandler.js';
import AppError     from './utils/AppError.js';

// ── Environment ───────────────────────────────────────────────────────────────
dotenv.config();

const app        = express();
const PORT       = process.env.PORT       || 5000;
const MONGO_URI  = process.env.MONGO_URI  || 'mongodb://localhost:27017/furshield';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const NODE_ENV   = process.env.NODE_ENV   || 'development';

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── HTTP request logger ───────────────────────────────────────────────────────
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Gzip compression ──────────────────────────────────────────────────────────
app.use(compression());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:         CLIENT_URL,
  credentials:    true,
  methods:        ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Rate limiters ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

app.use(generalLimiter);

// ── API Routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`,               authLimiter,  authRoutes);
app.use(`${API}/users`,              userRoutes);
app.use(`${API}/pets`,               petRoutes);
app.use(`${API}/health-records`,     healthRecordRoutes);
app.use(`${API}/appointments`,       appointmentRoutes);
app.use(`${API}/products`,           productRoutes);
app.use(`${API}/orders`,             orderRoutes);
app.use(`${API}/adoptions`,          adoptionListingRoutes);
app.use(`${API}/adoption-interests`, adoptionInterestRoutes);
app.use(`${API}/reviews`,            reviewRoutes);
app.use(`${API}/notifications`,      notificationRoutes);
app.use(`${API}/care-articles`,      careArticleRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({
  success: true, message: '🐾 FurShield API is running',
  version: '1.0.0', env: NODE_ENV, routes: `${API}/*`,
}));

app.get(`${API}/status`, (_req, res) => res.json({
  success: true, status: 'healthy',
  dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  timestamp: new Date().toISOString(),
  uptime: Math.floor(process.uptime()) + 's',
}));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.all('*', (req, _res, next) =>
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404))
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Startup ───────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 FurShield server  →  http://localhost:${PORT}`);
      console.log(`📡 API base          →  http://localhost:${PORT}${API}`);
      console.log(`🌍 Environment       →  ${NODE_ENV}`);
    });
  })
  .catch((err) => { console.error('❌ MongoDB connection failed:', err.message); process.exit(1); });

export default app;
