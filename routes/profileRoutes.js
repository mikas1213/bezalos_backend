const express = require('express');
const roles = require('../utils/roles');
const router = express.Router();
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');

router.route('/plans/:id')
    .all(authController.protect)
    .get(profileController.getAllUserPlans);

router.route('/products/:plan_id/:prod_id')
    .all(authController.protect,
        authController.isSubscription('profilis', 'virtuve', 'Virtuvė')
    )
    .patch(profileController.updateProduct)

router.route('/products')
    .all(authController.protect,
        // authController.isSubscription('virtuve')
    )
    .get(profileController.getAllProfileProducts);


module.exports = router;