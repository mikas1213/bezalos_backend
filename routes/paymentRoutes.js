const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');

router.route('/service-checkout-session').post(
    authController.protect, 
    paymentController.createServiceSession,
);


router.route('/checkout-session').post(
    authController.protect, 
    paymentController.createCheckoutSession
);

router.route('/payment-success').post(
    express.raw({type: 'application/json'}), 
    paymentController.paymentSuccess
);

router.route('/customer-portal-session').post(
    authController.protect, 
    paymentController.customerPortal
);

module.exports = router;
