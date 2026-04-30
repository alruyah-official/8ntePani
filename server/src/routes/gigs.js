const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const gigController = require('../controllers/gig');

router.get('/', gigController.getGigs);
router.get('/mine', authenticate, authorize(['seller', 'both']), gigController.getMyGigs);
router.get('/:id', gigController.getGigById);
router.post('/', authenticate, authorize(['seller', 'both']), gigController.createGig);
router.put('/:id', authenticate, authorize(['seller', 'both']), gigController.updateGig);
router.delete('/:id', authenticate, authorize(['seller', 'both']), gigController.deleteGig);
router.get('/:id/reviews', gigController.getGigReviews);

module.exports = router;