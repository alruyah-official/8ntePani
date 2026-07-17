import prisma from '../config/prisma.js';

// Safe client fields — password is always omitted
const CLIENT_SELECT = {
  id: true,
  name: true,
  avatar: true,
};

// Reusable include block for job queries — attaches client and category
const JOB_INCLUDE = {
  client: { select: CLIENT_SELECT },
  category: { select: { id: true, name: true } },
};

/**
 * Creates a new job posting on behalf of a CLIENT.
 * Throws 404 if the provided categoryId does not exist.
 *
 * @param {string} clientId - User id of the posting client
 * @param {object} data     - { title, description, categoryId, budget? }
 * @returns {object} Created Job with client and category details
 */
export const createJob = async (clientId, data) => {
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.job.create({
    data: { clientId, ...data },
    include: JOB_INCLUDE,
  });
};

/**
 * Returns all jobs with optional filters: categoryId, status, and a
 * case-insensitive search across title and description. Defaults to OPEN.
 *
 * @param {object} filters - { categoryId?, status?, search? }
 * @returns {object[]} Matching jobs ordered by createdAt descending
 */
export const getAllJobs = async (filters = {}) => {
  const { categoryId, status, search } = filters;

  // Build the where clause dynamically — only add keys that were provided
  const where = {};

  // Default to showing only OPEN jobs when no status filter is supplied
  where.status = status || 'OPEN';

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.job.findMany({
    where,
    include: JOB_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Returns a single job by id with client and category details.
 * Throws 404 if the job does not exist.
 *
 * @param {string} jobId
 * @returns {object} Job with full details
 */
export const getJobById = async (jobId) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: JOB_INCLUDE,
  });

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  return job;
};

/**
 * Updates a job posting. Only the owning client may update it, and only
 * while the job is still OPEN.
 * Throws 404 if not found, 403 if not the owner, 400 if not OPEN.
 *
 * @param {string} jobId
 * @param {string} clientId
 * @param {object} data - Partial job fields to update
 * @returns {object} Updated Job
 */
export const updateJob = async (jobId, clientId, data) => {
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  if (job.clientId !== clientId) {
    const error = new Error('You are not authorized to update this job');
    error.statusCode = 403;
    throw error;
  }

  if (job.status !== 'OPEN') {
    const error = new Error(
      'Cannot edit a job that is already in progress or completed'
    );
    error.statusCode = 400;
    throw error;
  }

  return prisma.job.update({
    where: { id: jobId },
    data,
    include: JOB_INCLUDE,
  });
};

/**
 * Transitions a job to a new status following allowed progression rules:
 * OPEN → IN_PROGRESS | COMPLETED, IN_PROGRESS → COMPLETED, COMPLETED → (none).
 * Throws 404 / 403 / 400 for invalid states.
 *
 * @param {string} jobId
 * @param {string} clientId
 * @param {string} status - Target status
 * @returns {object} Updated Job
 */
export const updateJobStatus = async (jobId, clientId, status) => {
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  if (job.clientId !== clientId) {
    const error = new Error('You are not authorized to update this job');
    error.statusCode = 403;
    throw error;
  }

  // Validate status transitions
  const validTransitions = {
    OPEN: ['IN_PROGRESS', 'COMPLETED'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: [],
  };

  if (!validTransitions[job.status].includes(status)) {
    const error = new Error('Invalid status transition');
    error.statusCode = 400;
    throw error;
  }

  return prisma.job.update({
    where: { id: jobId },
    data: { status },
    include: JOB_INCLUDE,
  });
};

/**
 * Deletes a job posting. Only the owning client may delete it, and only
 * while the job is still OPEN.
 * Throws 404 if not found, 403 if not the owner, 400 if not OPEN.
 *
 * @param {string} jobId
 * @param {string} clientId
 * @returns {object} Deleted Job record
 */
export const deleteJob = async (jobId, clientId) => {
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  if (job.clientId !== clientId) {
    const error = new Error('You are not authorized to delete this job');
    error.statusCode = 403;
    throw error;
  }

  if (job.status !== 'OPEN') {
    const error = new Error(
      'Cannot delete a job that is already in progress or completed'
    );
    error.statusCode = 400;
    throw error;
  }

  return prisma.job.delete({ where: { id: jobId } });
};
