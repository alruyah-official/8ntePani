const gigService = require('../services/gig');
const slugify = require('../utils/slugify');

const getGigs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, subcategory, search } = req.query;
    const filters = { category, subcategory, search };
    const result = await gigService.findGigs(filters, parseInt(page), parseInt(limit));
    res.json({ data: result.gigs, total: result.total, page: result.page, limit: result.limit, message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMyGigs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await gigService.findMyGigs(req.user.id, parseInt(page), parseInt(limit));
    res.json({ data: result.gigs, total: result.total, page: result.page, limit: result.limit, message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getGigById = async (req, res) => {
  try {
    const gig = await gigService.findGigById(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    res.json({ data: gig, message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
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
    res.status(500).json({ message: 'Internal server error' });
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