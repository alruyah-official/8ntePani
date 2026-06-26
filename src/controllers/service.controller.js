import {
  createService as createServiceFn,
  updateService as updateServiceFn,
  deleteService as deleteServiceFn,
  getAllServices as getAllServicesFn,
  getServiceById as getServiceByIdFn,
  getServicesByFreelancer as getServicesByFreelancerFn,
} from '../services/service.service.js';

/**
 * POST /api/services
 * Creates a new service listing. Protected: FREELANCER only.
 */
export const createService = async (req, res) => {
  try {
    const service = await createServiceFn(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create service',
      error: error.message,
    });
  }
};

/**
 * PUT /api/services/:serviceId
 * Updates a service the authenticated freelancer owns.
 */
export const updateService = async (req, res) => {
  try {
    const service = await updateServiceFn(
      req.params.serviceId,
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: { service },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update service',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/services/:serviceId
 * Deletes a service the authenticated freelancer owns.
 */
export const deleteService = async (req, res) => {
  try {
    await deleteServiceFn(req.params.serviceId, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete service',
      error: error.message,
    });
  }
};

/**
 * GET /api/services
 * Returns all services with optional filters from query params. Public.
 * Query params: categoryId, minPrice, maxPrice, search
 */
export const getAllServices = async (req, res) => {
  try {
    const { categoryId, minPrice, maxPrice, search } = req.query;
    const services = await getAllServicesFn({ categoryId, minPrice, maxPrice, search });

    return res.status(200).json({
      success: true,
      message: 'Services fetched successfully',
      data: { count: services.length, services },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch services',
      error: error.message,
    });
  }
};

/**
 * GET /api/services/:serviceId
 * Returns a single service with all related data. Public.
 */
export const getServiceById = async (req, res) => {
  try {
    const service = await getServiceByIdFn(req.params.serviceId);

    return res.status(200).json({
      success: true,
      message: 'Service fetched successfully',
      data: { service },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch service',
      error: error.message,
    });
  }
};

/**
 * GET /api/services/freelancer/:userId
 * Returns all services listed by a specific freelancer. Public.
 */
export const getServicesByFreelancer = async (req, res) => {
  try {
    const services = await getServicesByFreelancerFn(req.params.userId);

    return res.status(200).json({
      success: true,
      message: 'Freelancer services fetched successfully',
      data: { count: services.length, services },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch freelancer services',
      error: error.message,
    });
  }
};
