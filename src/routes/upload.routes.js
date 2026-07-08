import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadSingle as uploadSingleMiddleware, uploadMultiple as uploadMultipleMiddleware } from '../middlewares/upload.middleware.js';
import { uploadSingle, uploadMultiple } from '../controllers/upload.controller.js';

const router = Router();

// POST /api/upload/single
router.post('/single', protect, uploadSingleMiddleware, uploadSingle);

// POST /api/upload/multiple
router.post('/multiple', protect, uploadMultipleMiddleware, uploadMultiple);

export default router;
