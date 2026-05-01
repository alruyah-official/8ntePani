const mongoose = require('mongoose');
const Review = require('../models/review');
const Gig = require('../models/gig');

const createReview = async (data) => {
  return await Review.create(data);
};

const deleteReview = async (id) => {
  return await Review.findByIdAndDelete(id);
};

const findReviewsByGig = async (gigId, page = 1, limit = 10) => {
  const query = { gigId };
  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('reviewer', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  return { reviews, total, page, limit };
};

const updateGigRating = async (gigId) => {
  const stats = await Review.aggregate([
    { $match: { gigId: mongoose.Types.ObjectId(gigId) } },
    {
      $group: {
        _id: '$gigId',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
  const avgRating = stats[0]?.avgRating || 0;
  const reviewCount = stats[0]?.reviewCount || 0;
  await Gig.findByIdAndUpdate(gigId, { avgRating, reviewCount });
};

module.exports = {
  createReview,
  deleteReview,
  findReviewsByGig,
  updateGigRating,
};