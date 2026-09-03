const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
  toggleCouponStatus,
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/validate', protect, validateCoupon);
router.get('/', protect, authorize('admin', 'seller'), getCoupons);
router.post('/', protect, authorize('admin', 'seller'), createCoupon);
router.delete('/:id', protect, authorize('admin', 'seller'), deleteCoupon);
router.patch('/:id/toggle', protect, authorize('admin', 'seller'), toggleCouponStatus);

module.exports = router;
