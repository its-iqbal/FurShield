import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

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

// ── Error handler (must be last) ──────────────────────────────────────────────
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/AppError.js';

// ── Load environment variables ────────────────────────────────────────────────
dotenv.config();

const app      = express();
const PORT     = process.env.PORT     || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/furshield';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      CLIENT_URL,
  credentials: true, // allow cookies
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── API Routes ─────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`,              authRoutes);
app.use(`${API}/users`,             userRoutes);
app.use(`${API}/pets`,              petRoutes);
app.use(`${API}/health-records`,    healthRecordRoutes);
app.use(`${API}/appointments`,      appointmentRoutes);
app.use(`${API}/products`,          productRoutes);
app.use(`${API}/orders`,            orderRoutes);
app.use(`${API}/adoptions`,         adoptionListingRoutes);
app.use(`${API}/adoption-interests`,adoptionInterestRoutes);
app.use(`${API}/reviews`,           reviewRoutes);
app.use(`${API}/notifications`,     notificationRoutes);
app.use(`${API}/care-articles`,     careArticleRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: '🐾 FurShield API is running',
    version: '1.0.0',
    routes:  `${API}/*`,
  });
});

app.get(`${API}/status`, (_req, res) => {
  res.json({
    success:  true,
    status:   'healthy',
    dbState:  mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ────────────────────────────────────────────────────────────────
app.all('*', (req, _res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
});

// ── Global error handler (must be LAST) ───────────────────────────────────────
app.use(errorHandler);

// ── MongoDB + Server startup ───────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 FurShield server running on http://localhost:${PORT}`);
      console.log(`📡 API base: http://localhost:${PORT}${API}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

export default app;
