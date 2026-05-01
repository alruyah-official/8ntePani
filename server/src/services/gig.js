const Gig = require('../models/gig');
const Review = require('../models/review');

const createGig = async (data) => {
  return await Gig.create(data);
};

const updateGig = async (id, data) => {
  return await Gig.findByIdAndUpdate(id, data, { new: true });
};

const deleteGig = async (id) => {
  return await Gig.findByIdAndDelete(id);
};

const findGigById = async (id) => {
  return await Gig.findById(id)
    .populate('seller', 'name username avatar')
    .populate({
      path: 'reviews',
      populate: { path: 'reviewer', select: 'name avatar' },
      options: { sort: { createdAt: -1 } }
    })
    .exec();
};

const findGigs = async (filters, page = 1, limit = 10) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.subcategory) query.subcategory = filters.subcategory;
  if (filters.search) {
    query.$or = [
      { title: new RegExp(filters.search, 'i') },
      { description: new RegExp(filters.search, 'i') },
      { tags: { $in: [filters.search] } }
    ];
  }
  const total = await Gig.countDocuments(query);
  const gigs = await Gig.find(query)
    .populate('seller', 'name username avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  return { gigs, total, page, limit };
};

const findMyGigs = async (sellerId, page = 1, limit = 10) => {
  const query = { sellerId };
  const total = await Gig.countDocuments(query);
  const gigs = await Gig.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  return { gigs, total, page, limit };
};

const findGigReviews = async (gigId, page = 1, limit = 10) => {
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

module.exports = {
  createGig,
  updateGig,
  deleteGig,
  findGigById,
  findGigs,
  findMyGigs,
  findGigReviews,
};