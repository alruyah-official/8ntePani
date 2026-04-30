const prisma = require('../config/database');

const updateUser = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

const findUserByUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username },
    include: {
      gigs: {
        select: {
          id: true,
          title: true,
          avgRating: true,
          reviewCount: true,
        }
      },
      _count: {
        select: {
          ordersAsBuyer: true,
          ordersAsSeller: true,
          reviews: true
        }
      }
    }
  });
};

const getUserStats = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          gigs: true,
          ordersAsBuyer: true,
          ordersAsSeller: true,
          reviews: true
        }
      }
    }
  });

  return {
    totalGigs: user._count.gigs,
    totalOrders: user._count.ordersAsBuyer + user._count.ordersAsSeller,
    totalReviews: user._count.reviews,
  };
};

module.exports = {
  updateUser,
  findUserByUsername,
  getUserStats,
};