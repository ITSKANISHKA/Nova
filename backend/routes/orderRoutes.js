const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('buyer'), placeOrder);
router.get('/my', protect, authorize('buyer'), getMyOrders);
router.get('/seller/mine', protect, authorize('seller', 'admin'), getSellerOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('seller', 'admin'), updateOrderStatus);

module.exports = router;
