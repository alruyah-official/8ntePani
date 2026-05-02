const gigService = require('../services/gig');
const slugify = require('../utils/slugify');

/**
 * Normalize a gig document so the client always receives a `seller` key,
 * regardless of whether `sellerId` was populated or not.
 */
function normalizeGig(gig) {
  if (!gig) return gig;
  const g = { ...gig };
  if (g.sellerId && typeof g.sellerId === 'object') {
    // Populated — rename to `seller` for client convenience
    g.seller = g.sellerId;
  }
  return g;
}

const getGigs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, subcategory, search, featured } = req.query;
    const filters = { category, subcategory, search, featured };
    const result = await gigService.findGigs(filters, parseInt(page), parseInt(limit));
    const gigs = (result.gigs || []).map(normalizeGig);
    res.json({ data: gigs, total: result.total, page: result.page, limit: result.limit, message: 'Success' });
  } catch (error) {
    console.error('[getGigs]', error);
    res.status(500).json({ message: error.message || 'Failed to fetch gigs' });
  }
};

const getMyGigs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await gigService.findMyGigs(req.user.id, parseInt(page), parseInt(limit));
    res.json({ data: result.gigs, total: result.total, page: result.page, limit: result.limit, message: 'Success' });
  } catch (error) {
    console.error('[getMyGigs]', error);
    res.status(500).json({ message: error.message || 'Failed to fetch your gigs' });
  }
};

const getGigById = async (req, res) => {
  try {
    const gig = await gigService.findGigById(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    res.json({ data: normalizeGig(gig), message: 'Success' });
  } catch (error) {
    console.error('[getGigById]', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid gig ID format' });
    }
    res.status(500).json({ message: error.message || 'Failed to fetch gig' });
  }
};

const createGig = async (req, res) => {
  try {
    const data = { ...req.body, sellerId: req.user.id, slug: slugify(req.body.title) };
    const gig = await gigService.createGig(data);
    res.status(201).json({ data: gig, message: 'Gig created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateGig = async (req, res) => {
  try {
    const gig = await gigService.findGigById(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    if (gig.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const data = req.body;
    if (data.title) data.slug = slugify(data.title);
    const updatedGig = await gigService.updateGig(req.params.id, data);
    res.json({ data: updatedGig, message: 'Gig updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteGig = async (req, res) => {
  try {
    const gig = await gigService.findGigById(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    if (gig.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await gigService.deleteGig(req.params.id);
    res.json({ message: 'Gig deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getGigReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await gigService.findGigReviews(req.params.id, parseInt(page), parseInt(limit));
    res.json({ data: result.reviews, total: result.total, page: result.page, limit: result.limit, message: 'Success' });
  } catch (error) {
    console.error('[getGigReviews]', error);
    res.status(500).json({ message: error.message || 'Failed to fetch reviews' });
  }
};

module.exports = {
  getGigs,
  getMyGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
  getGigReviews,
};