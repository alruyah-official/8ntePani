import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes.js';

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
