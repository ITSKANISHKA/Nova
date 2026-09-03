const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private (Buyer)
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code) {
    res.status(400);
    throw new Error('Coupon code is required');
  }

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid or expired coupon code');
  }

  if (new Date() > new Date(coupon.expiresAt)) {
    res.status(400);
    throw new Error('Coupon code has expired');
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  if (cartTotal < coupon.minPurchase) {
    res.status(400);
    throw new Error(`Minimum purchase of $${coupon.minPurchase.toFixed(2)} required for this coupon`);
  }

  let discountAmount = 0;
  if (coupon.discountPercent > 0) {
    discountAmount = (cartTotal * coupon.discountPercent) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (coupon.discountAmount > 0) {
    discountAmount = Math.min(coupon.discountAmount, cartTotal);
  }

  res.json({
    success: true,
    code: coupon.code,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountPercent: coupon.discountPercent,
    message: `Coupon applied successfully! You saved $${discountAmount.toFixed(2)}`,
  });
});

// @desc    Get all coupons (Admin/Seller)
// @route   GET /api/coupons
// @access  Private (Admin/Seller)
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private (Admin/Seller)
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercent, discountAmount, minPurchase, maxDiscount, expiresAt, usageLimit } = req.body;

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountPercent: discountPercent || 0,
    discountAmount: discountAmount || 0,
    minPurchase: minPurchase || 0,
    maxDiscount: maxDiscount || null,
    expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    usageLimit: usageLimit || null,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, coupon });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin/Seller)
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  await coupon.deleteOne();
  res.json({ success: true, message: 'Coupon deleted successfully' });
});

// @desc    Toggle active status of coupon
// @route   PATCH /api/coupons/:id/toggle
// @access  Private (Admin/Seller)
const toggleCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.json({ success: true, coupon });
});

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
  toggleCouponStatus,
};
