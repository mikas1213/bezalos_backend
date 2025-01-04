const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const discountController = require('../controllers/discountController');

router.route('/apply/:code').post(
    authController.protect, 
    discountController.validateDiscountCode, 
    discountController.applyDiscountCode
);

module.exports = router;