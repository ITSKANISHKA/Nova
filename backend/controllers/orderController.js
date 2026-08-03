const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Place a new order (after successful payment verification)
// @route   POST /api/orders
// @access  Private (buyer)
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentInfo } = req.body;

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
    res.status(400);
    throw new Error('Please provide a complete shipping address');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product'
  );

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Validate stock and build order items
  const orderItems = [];
  let itemsTotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      res.status(400);
      throw new Error(`Product no longer available: ${item.product?._id}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const price = product.discountPrice || product.price;
    itemsTotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price,
      quantity: item.quantity,
      seller: product.seller,
    });
  }

  const shippingFee = itemsTotal > 500 ? 0 : 49;
  const totalAmount = itemsTotal + shippingFee;

  const order = await Order.create({
    buyer: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentInfo: {
      razorpayOrderId: paymentInfo?.razorpay_order_id,
      razorpayPaymentId: paymentInfo?.razorpay_payment_id,
      razorpaySignature: paymentInfo?.razorpay_signature,
      status: paymentInfo?.razorpay_payment_id ? 'paid' : 'pending',
    },
    itemsTotal,
    shippingFee,
    totalAmount,
  });

  // Decrement stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, order });
});

// @desc    Get logged-in buyer's orders
// @route   GET /api/orders/my
// @access  Private (buyer)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (owner buyer / seller of item / admin)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'buyer',
    'name email'
  );

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isBuyer = order.buyer._id.toString() === req.user._id.toString();
  const isSellerOfItem = order.items.some(
    (i) => i.seller.toString() === req.user._id.toString()
  );

  if (!isBuyer && !isSellerOfItem && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.status(200).json({ success: true, order });
});

// @desc    Get orders containing logged-in seller's products
// @route   GET /api/orders/seller/mine
// @access  Private (seller)
const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    'items.seller': req.user._id,
  }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (seller of item / admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    'placed',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isSellerOfItem = order.items.some(
    (i) => i.seller.toString() === req.user._id.toString()
  );
  if (!isSellerOfItem && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  order.orderStatus = status;
  if (status === 'delivered') order.deliveredAt = new Date();

  await order.save();
  res.status(200).json({ success: true, order });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
};
