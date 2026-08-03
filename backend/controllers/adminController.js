const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, users });
});

// @desc    Activate/deactivate a user
// @route   PUT /api/admin/users/:id/status
// @access  Private (admin)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isActive = !user.isActive;
  await user.save();
  res.status(200).json({ success: true, user });
});

// @desc    Get all products (including inactive) for moderation
// @route   GET /api/admin/products
// @access  Private (admin)
const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find().populate('seller', 'name email');
  res.status(200).json({ success: true, count: products.length, products });
});

// @desc    Get all orders on the platform
// @route   GET /api/admin/orders
// @access  Private (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('buyer', 'name email').sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc    Dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalSellers, totalProducts, totalOrders, revenueAgg] =
    await Promise.all([
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { 'paymentInfo.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
  });
});

module.exports = {
  getAllUsers,
  toggleUserStatus,
  getAllProductsAdmin,
  getAllOrders,
  getDashboardStats,
};
