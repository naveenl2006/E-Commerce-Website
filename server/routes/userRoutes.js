const express = require('express');
const {
    addToCart,
    getCart,
    removeFromCart,
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    getAllUsers,
    getProfile,
    updateProfile,
    changePassword,
    updatePreferences,
    deleteAccount
} = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.post('/cart', authenticate, addToCart);
router.get('/cart', authenticate, getCart);
router.delete('/cart/:itemId', authenticate, removeFromCart);

router.post('/wishlist', authenticate, addToWishlist);
router.get('/wishlist', authenticate, getWishlist);
router.delete('/wishlist/:productId', authenticate, removeFromWishlist);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.put('/preferences', authenticate, updatePreferences);
router.delete('/account', authenticate, deleteAccount);

router.get('/admin/users', authenticate, isAdmin, getAllUsers);

module.exports = router;
