import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { generalRateLimit, authRateLimit } from './middleware/rateLimit.js';
import authRoutes from './routes/authRoutes.js';
import petRoutes from './routes/petRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Trust the platform proxy (Vercel/Render) so client IPs resolve correctly for rate limiting
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());

// Rate Limiting (Upstash-backed; no-ops locally when Upstash env vars are unset)
app.use('/api', generalRateLimit);
app.use('/api/auth/login', authRateLimit);
app.use('/api/auth/register', authRateLimit);

// CORS Config — same-origin in production needs no allow-list; falls back to open for dev/legacy split deploys
const clientUrl = process.env.CLIENT_URL;
app.use(cors({
  origin: process.env.NODE_ENV === 'production' && clientUrl ? clientUrl : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Body Parsing
app.use(express.json({ limit: '10kb' })); // Limit body size

// Data Sanitization
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS

app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/pet', petRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/ai', aiRoutes);

export default app;
