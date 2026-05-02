const Gig = require('../models/gig');
const Review = require('../models/review');

// Reusable seller populate config.
// The schema field is `sellerId` (ObjectId → User).
// We populate it with { path: 'sellerId' } so Mongoose resolves it,
// then the controller/client accesses it as gig.sellerId (populated User doc).
const SELLER_POPULATE = {
  path: 'sellerId',
  model: 'User',
  select: 'name username avatar sellerLevel',
  strictPopulate: false,
};

const createGig = async (data) => {
  return await Gig.create(data);
};

const updateGig = async (id, data) => {
  return await Gig.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteGig = async (id) => {
  return await Gig.findByIdAndDelete(id);
};

const findGigById = async (id) => {
  return await Gig
    .findById(id)
    .populate(SELLER_POPULATE)
    .populate({
      path: 'reviews',
      populate: { path: 'reviewer', select: 'name avatar', strictPopulate: false },
      options: { sort: { createdAt: -1 } },
      strictPopulate: false,
    })
    .lean({ virtuals: true })
    .exec();
};

const findGigs = async (filters = {}, page = 1, limit = 10) => {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const safePage  = Math.max(parseInt(page) || 1, 1);
  const skip      = (safePage - 1) * safeLimit;

  // Build filter query
  const query = { isActive: true };
  if (filters.category)    query.category    = new RegExp(`^${filters.category}$`, 'i');
  if (filters.subcategory) query.subcategory = new RegExp(`^${filters.subcategory}$`, 'i');
  if (filters.search) {
    query.$or = [
      { title:       new RegExp(filters.search, 'i') },
      { description: new RegExp(filters.search, 'i') },
      { tags:        { $in: [new RegExp(filters.search, 'i')] } },
    ];
  }
  if (filters.featured === true || filters.featured === 'true') {
    query.isFeatured = true;
  }
  if (filters.minPrice || filters.maxPrice) {
    // Price filter: compare against basic package price (fallback to 0)
    // We store this as avgPrice virtual; use avgRating field as proxy.
    // For now, skip price range filter at DB level (done on client if needed).
  }

  const [total, gigs] = await Promise.all([
    Gig.countDocuments(query),
    Gig.find(query)
      .populate(SELLER_POPULATE)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean({ virtuals: true })
      .exec(),
  ]);

  return { gigs, total, page: safePage, limit: safeLimit };
};

const findMyGigs = async (sellerId, page = 1, limit = 10) => {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const safePage  = Math.max(parseInt(page) || 1, 1);
  const skip      = (safePage - 1) * safeLimit;

  const query = { sellerId };
  const [total, gigs] = await Promise.all([
    Gig.countDocuments(query),
    Gig.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean({ virtuals: true })
      .exec(),
  ]);
  return { gigs, total, page: safePage, limit: safeLimit };
};

const findGigReviews = async (gigId, page = 1, limit = 10) => {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const safePage  = Math.max(parseInt(page) || 1, 1);
  const skip      = (safePage - 1) * safeLimit;

  const query = { gigId };
  const [total, reviews] = await Promise.all([
    Review.countDocuments(query),
    Review.find(query)
      .populate({ path: 'reviewer', select: 'name avatar', strictPopulate: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean()
      .exec(),
  ]);
  return { reviews, total, page: safePage, limit: safeLimit };
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