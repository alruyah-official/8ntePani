import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

// POST /api/auth/register  →  create a new account
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login     →  authenticate and receive a JWT
router.post('/login', validate(loginSchema), login);

export default router;
