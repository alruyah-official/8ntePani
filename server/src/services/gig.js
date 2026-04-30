const prisma = require('../config/database');

const createGig = async (data) => {
  return await prisma.gig.create({ data });
};

const updateGig = async (id, data) => {
  return await prisma.gig.update({ where: { id }, data });
};

const deleteGig = async (id) => {
  return await prisma.gig.delete({ where: { id } });
};

const findGigById = async (id) => {
  return await prisma.gig.findUnique({
    where: { id },
    include: {
      seller: {
        select: { id: true, name: true, username: true, avatar: true }
      },
      reviews: {
        include: { reviewer: { select: { name: true, avatar: true } } }
      }
    }
  });
};

const findGigs = async (filters, page = 1, limit = 10) => {
  const where = {};
  if (filters.category) where.category = filters.category;
  if (filters.subcategory) where.subcategory = filters.subcategory;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { tags: { hasSome: [filters.search] } }
    ];
  }
  const total = await prisma.gig.count({ where });
  const gigs = await prisma.gig.findMany({
    where,
    include: {
      seller: { select: { name: true, username: true, avatar: true } }
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
  return { gigs, total, page, limit };
};

const findMyGigs = async (sellerId, page = 1, limit = 10) => {
  const total = await prisma.gig.count({ where: { sellerId } });
  const gigs = await prisma.gig.findMany({
    where: { sellerId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
  return { gigs, total, page, limit };
};

const findGigReviews = async (gigId, page = 1, limit = 10) => {
  const total = await prisma.review.count({ where: { gigId } });
  const reviews = await prisma.review.findMany({
    where: { gigId },
    include: { reviewer: { select: { name: true, avatar: true } } },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
  return { reviews, total, page, limit };
};

module.exports = {
  createGig,
  updateGig,
  deleteGig,
  findGigById,
  findGigs,
  findMyGigs,
  findGigReviews,
};