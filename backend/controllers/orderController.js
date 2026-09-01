const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Place a new order (after successful payment verification)
// @route   POST /api/orders
// @access  Private (buyer)
//
// CONCURRENCY FIX: wraps stock validation + decrement + order creation + cart
// clear in a single MongoDB transaction, with each stock decrement done as an
// ATOMIC conditional update (`findOneAndUpdate` with a `stock: {$gte: qty}`
// filter). This closes a real race condition: previously, two buyers checking
// out the last unit of a product at nearly the same time could both pass the
// "is there enough stock" check before either write happened, resulting in
// negative stock / overselling. Now, the update itself is the check — if two
// requests race, only one `findOneAndUpdate` can succeed for the last unit;
// the other gets `null` back and the whole transaction aborts and rolls back
// cleanly (no partial orders, no partially-decremented stock).
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentInfo } = req.body;

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
    res.status(400);
    throw new Error('Please provide a complete shipping address');
  }

  const session = await mongoose.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product')
        .session(session);

      if (!cart || cart.items.length === 0) {
        throw Object.assign(new Error('Cart is empty'), { statusCode: 400 });
      }

      const orderItems = [];
      let itemsTotal = 0;

      // Each iteration atomically checks-and-decrements stock in one DB
      // operation, inside the transaction — no separate "check" pass.
      for (const item of cart.items) {
        const product = item.product;
        if (!product || !product.isActive) {
          throw Object.assign(
            new Error(`Product no longer available: ${item.product?._id}`),
            { statusCode: 400 }
          );
        }

        const updatedProduct = await Product.findOneAndUpdate(
          { _id: product._id, isActive: true, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true, session }
        );

        if (!updatedProduct) {
          // Either stock ran out or another concurrent order just took it -
          // throwing here aborts the ENTIRE transaction, so any stock we
          // already decremented earlier in this loop is automatically rolled
          // back by MongoDB. No manual "undo" bookkeeping needed.
          throw Object.assign(
            new Error(`Insufficient stock for ${product.name}`),
            { statusCode: 400 }
          );
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

      const orderDocs = await Order.create(
        [
          {
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
          },
        ],
        { session }
      );
      createdOrder = orderDocs[0];

      cart.items = [];
      await cart.save({ session });
    });
  } catch (err) {
    if (err.statusCode) res.status(err.statusCode);
    throw err;
  } finally {
    session.endSession();
  }

  res.status(201).json({ success: true, order: createdOrder });
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
// const asyncHandler = require('express-async-handler');
// const Order = require('../models/Order');
// const Cart = require('../models/Cart');
// const Product = require('../models/Product');

// // @desc    Place a new order (after successful payment verification)
// // @route   POST /api/orders
// // @access  Private (buyer)
// const placeOrder = asyncHandler(async (req, res) => {
//   const { shippingAddress, paymentInfo } = req.body;

//   if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
//     res.status(400);
//     throw new Error('Please provide a complete shipping address');
//   }

//   const cart = await Cart.findOne({ user: req.user._id }).populate(
//     'items.product'
//   );

//   if (!cart || cart.items.length === 0) {
//     res.status(400);
//     throw new Error('Cart is empty');
//   }

//   // Validate stock and build order items
//   const orderItems = [];
//   let itemsTotal = 0;

//   for (const item of cart.items) {
//     const product = item.product;
//     if (!product || !product.isActive) {
//       res.status(400);
//       throw new Error(`Product no longer available: ${item.product?._id}`);
//     }
//     if (product.stock < item.quantity) {
//       res.status(400);
//       throw new Error(`Insufficient stock for ${product.name}`);
//     }

//     const price = product.discountPrice || product.price;
//     itemsTotal += price * item.quantity;

//     orderItems.push({
//       product: product._id,
//       name: product.name,
//       image: product.images?.[0] || '',
//       price,
//       quantity: item.quantity,
//       seller: product.seller,
//     });
//   }

//   const shippingFee = itemsTotal > 500 ? 0 : 49;
//   const totalAmount = itemsTotal + shippingFee;

//   const order = await Order.create({
//     buyer: req.user._id,
//     items: orderItems,
//     shippingAddress,
//     paymentInfo: {
//       razorpayOrderId: paymentInfo?.razorpay_order_id,
//       razorpayPaymentId: paymentInfo?.razorpay_payment_id,
//       razorpaySignature: paymentInfo?.razorpay_signature,
//       status: paymentInfo?.razorpay_payment_id ? 'paid' : 'pending',
//     },
//     itemsTotal,
//     shippingFee,
//     totalAmount,
//   });

//   // Decrement stock
//   for (const item of cart.items) {
//     await Product.findByIdAndUpdate(item.product._id, {
//       $inc: { stock: -item.quantity },
//     });
//   }

//   // Clear cart
//   cart.items = [];
//   await cart.save();

//   res.status(201).json({ success: true, order });
// });

// // @desc    Get logged-in buyer's orders
// // @route   GET /api/orders/my
// // @access  Private (buyer)
// const getMyOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({ buyer: req.user._id }).sort({
//     createdAt: -1,
//   });
//   res.status(200).json({ success: true, count: orders.length, orders });
// });

// // @desc    Get single order
// // @route   GET /api/orders/:id
// // @access  Private (owner buyer / seller of item / admin)
// const getOrderById = asyncHandler(async (req, res) => {
//   const order = await Order.findById(req.params.id).populate(
//     'buyer',
//     'name email'
//   );

//   if (!order) {
//     res.status(404);
//     throw new Error('Order not found');
//   }

//   const isBuyer = order.buyer._id.toString() === req.user._id.toString();
//   const isSellerOfItem = order.items.some(
//     (i) => i.seller.toString() === req.user._id.toString()
//   );

//   if (!isBuyer && !isSellerOfItem && req.user.role !== 'admin') {
//     res.status(403);
//     throw new Error('Not authorized to view this order');
//   }

//   res.status(200).json({ success: true, order });
// });

// // @desc    Get orders containing logged-in seller's products
// // @route   GET /api/orders/seller/mine
// // @access  Private (seller)
// const getSellerOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({
//     'items.seller': req.user._id,
//   }).sort({ createdAt: -1 });

//   res.status(200).json({ success: true, count: orders.length, orders });
// });

// // @desc    Update order status
// // @route   PUT /api/orders/:id/status
// // @access  Private (seller of item / admin)
// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
//   const validStatuses = [
//     'placed',
//     'confirmed',
//     'shipped',
//     'delivered',
//     'cancelled',
//   ];

//   if (!validStatuses.includes(status)) {
//     res.status(400);
//     throw new Error('Invalid order status');
//   }

//   const order = await Order.findById(req.params.id);
//   if (!order) {
//     res.status(404);
//     throw new Error('Order not found');
//   }

//   const isSellerOfItem = order.items.some(
//     (i) => i.seller.toString() === req.user._id.toString()
//   );
//   if (!isSellerOfItem && req.user.role !== 'admin') {
//     res.status(403);
//     throw new Error('Not authorized to update this order');
//   }

//   order.orderStatus = status;
//   if (status === 'delivered') order.deliveredAt = new Date();

//   await order.save();
//   res.status(200).json({ success: true, order });
// });

// module.exports = {
//   placeOrder,
//   getMyOrders,
//   getOrderById,
//   getSellerOrders,
//   updateOrderStatus,
// };
