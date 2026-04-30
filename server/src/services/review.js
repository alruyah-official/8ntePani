const prisma = require('../config/database');

const createReview = async (data) => {
  return await prisma.review.create({ data });
};

const deleteReview = async (id) => {
  return await prisma.review.delete({ where: { id } });
};

const findReviewsByGig = async (gigId, page = 1, limit = 10) => {
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

const updateGigRating = async (gigId) => {
  const reviews = await prisma.review.findMany({
    where: { gigId },
    select: { rating: true }
  });
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const reviewCount = reviews.length;
  await prisma.gig.update({
    where: { id: gigId },
    data: { avgRating, reviewCount }
  });
};

module.exports = {
  createReview,
  deleteReview,
  findReviewsByGig,
  updateGigRating,
};