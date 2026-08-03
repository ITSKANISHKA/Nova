const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Electronics',
        'Fashion',
        'Home & Kitchen',
        'Books',
        'Beauty',
        'Sports',
        'Toys',
        'Grocery',
        'Other',
      ],
    },
    brand: { type: String, default: '' },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: [{ type: String }],
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
