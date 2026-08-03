const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products with search, filter, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isActive: true };

  if (keyword) {
    query.$text = { $search: keyword };
  }
  if (category) {
    query.category = category;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'rating') sortOption = { ratingsAverage: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Number(limit));

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('seller', 'name'),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'seller',
    'name email'
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({ success: true, product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (seller/admin)
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, brand, images } =
    req.body;

  if (!name || !description || !price || !category || stock === undefined) {
    res.status(400);
    throw new Error('Please provide all required product fields');
  }

  const product = await Product.create({
    seller: req.user._id,
    name,
    description,
    price,
    category,
    stock,
    brand: brand || '',
    images: images || [],
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (owner seller/admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Ownership check - sellers can only edit their own products
  if (
    req.user.role !== 'admin' &&
    product.seller.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  const allowedFields = [
    'name',
    'description',
    'price',
    'discountPrice',
    'category',
    'brand',
    'stock',
    'images',
    'isActive',
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  await product.save();
  res.status(200).json({ success: true, product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (owner seller/admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (
    req.user.role !== 'admin' &&
    product.seller.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted' });
});

// @desc    Get products for logged-in seller
// @route   GET /api/products/seller/mine
// @access  Private (seller)
const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, count: products.length, products });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
};
