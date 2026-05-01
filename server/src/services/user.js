const User = require('../models/user');
const Gig = require('../models/gig');
const Order = require('../models/order');
const Review = require('../models/review');

const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true, select: '-password' }).exec();
};

const findUserByUsername = async (username) => {
  const user = await User.findOne({ username }).select('-password').exec();
  if (!user) return null;
  const gigs = await Gig.find({ sellerId: user._id }).select('id title avgRating reviewCount').exec();
  const ordersAsBuyer = await Order.countDocuments({ buyerId: user._id });
  const ordersAsSeller = await Order.countDocuments({ sellerId: user._id });
  const reviews = await Review.countDocuments({ reviewerId: user._id });

  return {
    ...user.toObject(),
    gigs,
    _count: {
      ordersAsBuyer,
      ordersAsSeller,
      reviews,
    }
  };
};

const getUserStats = async (id) => {
  const totalGigs = await Gig.countDocuments({ sellerId: id });
  const totalOrders = await Order.countDocuments({ buyerId: id }) + await Order.countDocuments({ sellerId: id });
  const totalReviews = await Review.countDocuments({ reviewerId: id });

  return {
    totalGigs,
    totalOrders,
    totalReviews,
  };
};

module.exports = {
  updateUser,
  findUserByUsername,
  getUserStats,
};