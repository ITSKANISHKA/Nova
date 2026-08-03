const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  addReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, authorize('buyer'), addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
