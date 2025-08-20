const express = require('express');
const {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.post('/', authenticate, createOrder);
router.get('/user', authenticate, getUserOrders);
router.get('/admin', authenticate, isAdmin, getAllOrders);
router.put('/:id/status', authenticate, isAdmin, updateOrderStatus);

module.exports = router;
