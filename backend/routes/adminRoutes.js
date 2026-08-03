const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  toggleUserStatus,
  getAllProductsAdmin,
  getAllOrders,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/products', getAllProductsAdmin);
router.get('/orders', getAllOrders);

module.exports = router;
