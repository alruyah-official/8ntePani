import {
  createCategory as createCategoryService,
  getAllCategories as getAllCategoriesService,
} from '../services/category.service.js';

/**
 * POST /api/categories
 * Creates a new category. Requires authentication.
 * Expects: { name, slug } in req.body
 */
export const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const category = await createCategoryService(name, slug);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create category',
      error: error.message,
    });
  }
};

/**
 * GET /api/categories
 * Returns all categories. Public route.
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await getAllCategoriesService();

    return res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: { categories },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch categories',
      error: error.message,
    });
  }
};
