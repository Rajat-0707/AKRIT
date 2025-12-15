import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.js';
import artistsRoutes from './routes/artists.js';
import artistRoutes from './routes/artist.js';
import bookingsRoutes from './routes/bookings.js';
import { handleUploadError } from './middleware/upload.js';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost,http://127.0.0.1')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, true); 
  },
  credentials: true,
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

// Routes
app.use('/api', authRoutes);
app.use('/api', artistsRoutes);
app.use('/api', artistRoutes);
app.use('/api', bookingsRoutes);

// Error handling middleware for uploads
app.use(handleUploadError);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
