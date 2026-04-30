const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const reviewController = require('../controllers/review');

router.get('/gig/:gigId', reviewController.getReviewsByGig);
router.post('/', authenticate, reviewController.createReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;