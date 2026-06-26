import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import {
  createService,
  updateService,
  deleteService,
  getAllServices,
  getServiceById,
  getServicesByFreelancer,
} from '../controllers/service.controller.js';

const router = Router();

// ── Protected: FREELANCER only ────────────────────────────────────────────────

// POST   /api/services             → create a new service listing
router.post('/', protect, restrictTo('FREELANCER'), createService);

// PUT    /api/services/:serviceId  → update own service
router.put('/:serviceId', protect, restrictTo('FREELANCER'), updateService);

// DELETE /api/services/:serviceId  → delete own service
router.delete('/:serviceId', protect, restrictTo('FREELANCER'), deleteService);

// ── Public ────────────────────────────────────────────────────────────────────

// GET    /api/services                      → list all services (with optional filters)
router.get('/', getAllServices);

// IMPORTANT: /freelancer/:userId MUST be declared before /:serviceId
// Otherwise Express matches the literal string "freelancer" as a serviceId.

// GET    /api/services/freelancer/:userId   → all services by a specific freelancer
router.get('/freelancer/:userId', getServicesByFreelancer);

// GET    /api/services/:serviceId           → single service with full detail
router.get('/:serviceId', getServiceById);

export default router;
