import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/register  →  create a new account
router.post('/register', register);

// POST /api/auth/login     →  authenticate and receive a JWT
router.post('/login', login);

export default router;
