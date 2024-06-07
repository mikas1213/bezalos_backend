const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');

router.route('/checkout-session').post(
    authController.protect, 
    paymentController.createCheckoutSession
);

router.route('/payment-success').post(
    express.raw({type: 'application/json'}), 
    paymentController.paymentSuccess
);


// stripe webhooks
router.route('/payment-success-webhook').post(
    express.raw({type: 'application/json'}), 
    paymentController.paymentSuccessWebHook,
);

module.exports = router;
