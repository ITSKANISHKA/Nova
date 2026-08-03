require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

// Deterministic demo images (picsum.photos - free, no attribution needed, great for testing)
const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const SAMPLE_PRODUCTS = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Over-ear headphones with active noise cancellation and 30hr battery life.',
    price: 2499, discountPrice: 1999, category: 'Electronics', brand: 'SoundWave', stock: 50,
    images: [img('headphones1')],
  },
  {
    name: 'Smartwatch Fitness Tracker',
    description: 'Track heart rate, sleep, and workouts. 7-day battery, water resistant.',
    price: 3499, discountPrice: 2799, category: 'Electronics', brand: 'PulseFit', stock: 40,
    images: [img('smartwatch1')],
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Compact speaker with rich bass, 12-hour playtime, splash-proof.',
    price: 1799, category: 'Electronics', brand: 'SoundWave', stock: 60,
    images: [img('speaker1')],
  },
  {
    name: 'Cotton Casual T-Shirt',
    description: 'Breathable 100% cotton t-shirt, available in multiple colors.',
    price: 599, category: 'Fashion', brand: 'UrbanFit', stock: 200,
    images: [img('tshirt1')],
  },
  {
    name: "Men's Denim Jacket",
    description: 'Classic slim-fit denim jacket, durable stitching, all-season wear.',
    price: 2199, discountPrice: 1799, category: 'Fashion', brand: 'UrbanFit', stock: 35,
    images: [img('jacket1')],
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight mesh running shoes with cushioned sole for daily runs.',
    price: 2999, discountPrice: 2399, category: 'Sports', brand: 'StrideMax', stock: 80,
    images: [img('shoes1')],
  },
  {
    name: 'Non-Stick Frying Pan',
    description: '28cm non-stick frying pan, induction compatible, ergonomic handle.',
    price: 899, category: 'Home & Kitchen', brand: 'CookPro', stock: 75,
    images: [img('pan1')],
  },
  {
    name: 'Electric Kettle 1.5L',
    description: 'Fast-boil stainless steel kettle with auto shut-off safety feature.',
    price: 1299, discountPrice: 999, category: 'Home & Kitchen', brand: 'CookPro', stock: 55,
    images: [img('kettle1')],
  },
  {
    name: '4-Slice Toaster',
    description: 'Wide-slot toaster with 7 browning levels and removable crumb tray.',
    price: 1599, category: 'Home & Kitchen', brand: 'CookPro', stock: 30,
    images: [img('toaster1')],
  },
  {
    name: 'The Silent Mountain — Novel',
    description: 'A gripping fiction bestseller about resilience and family.',
    price: 349, category: 'Books', brand: 'Penbird Press', stock: 120,
    images: [img('book1')],
  },
  {
    name: 'Habit-Tracking Notebook Set',
    description: 'Notebook set with weekly planning pages and habit trackers.',
    price: 449, discountPrice: 349, category: 'Books', brand: 'Penbird Press', stock: 90,
    images: [img('notebook1')],
  },
  {
    name: 'Herbal Face Wash 150ml',
    description: 'Gentle daily face wash with neem and aloe vera extracts.',
    price: 299, category: 'Beauty', brand: 'PureGlow', stock: 150,
    images: [img('facewash1')],
  },
  {
    name: 'Matte Lipstick Set (3 shades)',
    description: 'Long-lasting matte finish lipstick trio, transfer-proof formula.',
    price: 799, discountPrice: 649, category: 'Beauty', brand: 'PureGlow', stock: 70,
    images: [img('lipstick1')],
  },
  {
    name: 'Building Blocks Set (200 pcs)',
    description: 'Creative building block set for kids, compatible with major brands.',
    price: 1199, category: 'Toys', brand: 'KidJoy', stock: 45,
    images: [img('blocks1')],
  },
  {
    name: 'Organic Basmati Rice 5kg',
    description: 'Premium long-grain basmati rice, naturally aged for aroma.',
    price: 649, discountPrice: 549, category: 'Grocery', brand: 'FarmFresh', stock: 100,
    images: [img('rice1')],
  },
];

const run = async () => {
  await connectDB();

  let admin = await User.findOne({ email: 'admin@ecommerce.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: 'admin@ecommerce.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Admin created: admin@ecommerce.com / Admin@123');
  }

  let seller = await User.findOne({ email: 'seller@ecommerce.com' });
  if (!seller) {
    seller = await User.create({
      name: 'Demo Seller',
      email: 'seller@ecommerce.com',
      password: 'Seller@123',
      role: 'seller',
    });
    console.log('Seller created: seller@ecommerce.com / Seller@123');
  }

  // Replace any previously seeded demo products with the fresh, fuller catalog
  await Product.deleteMany({ seller: seller._id });
  await Product.insertMany(
    SAMPLE_PRODUCTS.map((p) => ({ ...p, seller: seller._id }))
  );
  console.log(`${SAMPLE_PRODUCTS.length} sample products seeded (with demo images)`);

  console.log('Seeding complete');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});