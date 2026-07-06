import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes.js';
import profileRoutes from './src/routes/profile.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import serviceRoutes from './src/routes/service.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import conversationRoutes from './src/routes/conversation.routes.js';
import { globalErrorHandler } from './src/middlewares/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middlewares ────────────────────────────────────────────────────────

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Enable Cross-Origin Resource Sharing (allow frontend to talk to this API)
app.use(cors());

// ─── Routes ───────────────────────────────────────────────────────────────────

// Auth: register + login
app.use('/api/auth', authRoutes);

// Freelancer Profile: create, update, fetch
app.use('/api/profile', profileRoutes);

// Categories: create (protected), list all (public)
app.use('/api/categories', categoryRoutes);

// Services: full CRUD for freelancers + public browsing
app.use('/api/services', serviceRoutes);

// Reviews: CLIENT creates/deletes, public fetch with stats
app.use('/api/reviews', reviewRoutes);

// Conversations & Messaging: CLIENT starts threads, both parties reply
app.use('/api/conversations', conversationRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '8ntePani API is running 🚀',
    version: '1.0.0',
  });
});

// ─── 404 Fallback ─────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: 'NOT_FOUND',
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────

app.use(globalErrorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
  console.log(`🌍  Environment: ${process.env.NODE_ENV ?? 'development'}`);
});
