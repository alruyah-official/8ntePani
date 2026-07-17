import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createJobSchema,
  updateJobSchema,
  updateStatusSchema,
} from '../validators/job.validator.js';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob,
} from '../controllers/job.controller.js';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────

// GET  /api/jobs          → list all jobs (with optional filters)
router.get('/', getAllJobs);

// ── Protected: CLIENT only ───────────────────────────────────────────────────

// POST /api/jobs          → create a new job posting
router.post('/', protect, restrictTo('CLIENT'), validate(createJobSchema), createJob);

// PUT  /api/jobs/:jobId   → update own job (OPEN only)
router.put('/:jobId', protect, restrictTo('CLIENT'), validate(updateJobSchema), updateJob);

// PATCH /api/jobs/:jobId/status → transition job status
// IMPORTANT: declared before /:jobId to prevent Express matching "status" as a jobId
router.patch('/:jobId/status', protect, restrictTo('CLIENT'), validate(updateStatusSchema), updateJobStatus);

// DELETE /api/jobs/:jobId → delete own job (OPEN only)
router.delete('/:jobId', protect, restrictTo('CLIENT'), deleteJob);

// ── Public (dynamic param — must be last) ─────────────────────────────────────

// GET  /api/jobs/:jobId   → single job with full details
// IMPORTANT: registered after all specific routes to avoid conflicts
router.get('/:jobId', getJobById);

export default router;
