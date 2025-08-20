const express = require('express');
const {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, isAdmin, createProduct);
router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

module.exports = router;
