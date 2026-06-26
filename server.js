import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes.js';
import profileRoutes from './src/routes/profile.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import serviceRoutes from './src/routes/service.routes.js';

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

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '8ntePani API is running 🚀',
    version: '1.0.0',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
  console.log(`🌍  Environment: ${process.env.NODE_ENV ?? 'development'}`);
});
