const express = require('express');
const roles = require('../utils/roles');
const router = express.Router();
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');

router.route('/plans')
    .all(authController.protect,
    // authController.isSubscription('virtuve'),
    // authController.verifyRoles(roles.admin)
    )
    .get(profileController.getAllUserPlans);

router.route('/products')
    .all(authController.protect,
        // authController.isSubscription('virtuve')
    )
    .get(profileController.getAllProfileProducts);


module.exports = router;