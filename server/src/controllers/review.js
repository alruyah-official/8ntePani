const reviewService = require('../services/review');
const Order = require('../models/order');
const Review = require('../models/review');

const getReviewsByGig = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await reviewService.findReviewsByGig(req.params.gigId, parseInt(page), parseInt(limit));
    res.json({ data: result.reviews, total: result.total, page: result.page, limit: result.limit, message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const order = await Order.findById(orderId).populate('reviews').exec();
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Order must be completed' });
    }
    if (order.reviews && order.reviews.length > 0) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }
    const data = {
      gigId: order.gigId,
      orderId,
      reviewerId: req.user.id,
      rating,
      comment
    };
    const review = await reviewService.createReview(data);
    await reviewService.updateGigRating(order.gigId);
    res.status(201).json({ data: review, message: 'Review created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).exec();
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await reviewService.deleteReview(req.params.id);
    await reviewService.updateGigRating(review.gigId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getReviewsByGig,
  createReview,
  deleteReview,
};