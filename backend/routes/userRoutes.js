const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.put('/profile', updateProfile);
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

module.exports = router;
