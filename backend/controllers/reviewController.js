const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Recalculate product's average rating
const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: stats[0]?.avgRating || 0,
    numReviews: stats[0]?.numReviews || 0,
  });
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reviews.length, reviews });
});

// @desc    Add a review (only buyers who purchased & received the product)
// @route   POST /api/reviews/:productId
// @access  Private (buyer)
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Please provide rating and comment');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Verify the buyer actually purchased & received this product
  const hasPurchased = await Order.findOne({
    buyer: req.user._id,
    orderStatus: 'delivered',
    'items.product': productId,
  });

  if (!hasPurchased) {
    res.status(403);
    throw new Error('You can only review products you have purchased and received');
  }

  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id,
  });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    comment,
  });

  await recalcProductRating(product._id);

  res.status(201).json({ success: true, review });
});

// @desc    Delete own review
// @route   DELETE /api/reviews/:id
// @access  Private (owner / admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const productId = review.product;
  await review.deleteOne();
  await recalcProductRating(productId);

  res.status(200).json({ success: true, message: 'Review deleted' });
});

module.exports = { getProductReviews, addReview, deleteReview };
