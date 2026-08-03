const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const allowedFields = ['name', 'phone', 'address', 'avatar'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });
  await user.save();
  res.status(200).json({ success: true, user });
});

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'wishlist',
    'name price discountPrice images ratingsAverage stock'
  );
  res.status(200).json({ success: true, wishlist: user.wishlist });
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const user = await User.findById(req.user._id);
  if (!user.wishlist.includes(req.params.productId)) {
    user.wishlist.push(req.params.productId);
    await user.save();
  }

  res.status(200).json({ success: true, wishlist: user.wishlist });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== req.params.productId
  );
  await user.save();
  res.status(200).json({ success: true, wishlist: user.wishlist });
});

module.exports = {
  updateProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
