const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const getRazorpayInstance = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// @desc    Create a Razorpay order (call before showing checkout modal)
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body; // amount in rupees

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid amount');
  }

  const razorpay = getRazorpayInstance();

  const options = {
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  res.status(200).json({
    success: true,
    order: razorpayOrder,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Missing payment verification fields');
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    res.status(400);
    throw new Error('Payment verification failed - signature mismatch');
  }

  res.status(200).json({ success: true, message: 'Payment verified' });
});

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
