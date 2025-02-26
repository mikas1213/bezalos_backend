const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const promotionsController = require('../controllers/promotionsController');

router.route('/apply/:code').post(
    authController.protect, 
    promotionsController.validatePromoCode, 
    promotionsController.applyPromoCode
);

module.exports = router;