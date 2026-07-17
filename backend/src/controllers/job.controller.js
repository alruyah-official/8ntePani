import {
  createJob as createJobFn,
  getAllJobs as getAllJobsFn,
  getJobById as getJobByIdFn,
  updateJob as updateJobFn,
  updateJobStatus as updateJobStatusFn,
  deleteJob as deleteJobFn,
} from '../services/job.service.js';

/**
 * POST /api/jobs
 * Creates a new job posting. Protected: CLIENT only.
 */
export const createJob = async (req, res) => {
  try {
    const job = await createJobFn(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create job',
      error: error.message,
    });
  }
};

/**
 * GET /api/jobs
 * Returns all jobs with optional filters. Public.
 * Query params: categoryId, status, search
 */
export const getAllJobs = async (req, res) => {
  try {
    const { categoryId, status, search } = req.query;
    const jobs = await getAllJobsFn({ categoryId, status, search });

    return res.status(200).json({
      success: true,
      message: 'Jobs fetched successfully',
      data: { count: jobs.length, jobs },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch jobs',
      error: error.message,
    });
  }
};

/**
 * GET /api/jobs/:jobId
 * Returns a single job with full details. Public.
 */
export const getJobById = async (req, res) => {
  try {
    const job = await getJobByIdFn(req.params.jobId);

    return res.status(200).json({
      success: true,
      message: 'Job fetched successfully',
      data: { job },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch job',
      error: error.message,
    });
  }
};

/**
 * PUT /api/jobs/:jobId
 * Updates a job the authenticated client owns. Protected: CLIENT only.
 */
export const updateJob = async (req, res) => {
  try {
    const job = await updateJobFn(req.params.jobId, req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update job',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/jobs/:jobId/status
 * Transitions a job to a new status. Protected: CLIENT only.
 */
export const updateJobStatus = async (req, res) => {
  try {
    const job = await updateJobStatusFn(
      req.params.jobId,
      req.user.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      data: { job },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update job status',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/jobs/:jobId
 * Deletes a job the authenticated client owns. Protected: CLIENT only.
 */
export const deleteJob = async (req, res) => {
  try {
    await deleteJobFn(req.params.jobId, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete job',
      error: error.message,
    });
  }
};
