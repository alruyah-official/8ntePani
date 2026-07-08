import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createCategory, getAllCategories } from '../controllers/category.controller.js';

const router = Router();

// POST /api/categories → authenticated users only (no role restriction — add restrictTo('ADMIN') when an admin role is introduced)
router.post('/', protect, createCategory);

// GET  /api/categories → public
router.get('/', getAllCategories);

export default router;
