import prisma from '../config/prisma.js';

/**
 * Creates a new service category.
 * Throws 409 if a category with the same slug already exists.
 *
 * @param {string} name - Display name (e.g. "Web Development")
 * @param {string} slug - URL-safe identifier (e.g. "web-development")
 * @returns {object} Created Category
 */
export const createCategory = async (name, slug) => {
  const existing = await prisma.category.findUnique({ where: { slug } });

  if (existing) {
    const error = new Error(`A category with slug "${slug}" already exists`);
    error.statusCode = 409;
    throw error;
  }

  return prisma.category.create({ data: { name, slug } });
};

/**
 * Returns all categories ordered alphabetically by name.
 *
 * @returns {object[]} Array of Category records
 */
export const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
};
