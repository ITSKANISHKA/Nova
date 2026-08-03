const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-order', protect, authorize('buyer'), createRazorpayOrder);
router.post('/verify', protect, authorize('buyer'), verifyRazorpayPayment);

module.exports = router;
