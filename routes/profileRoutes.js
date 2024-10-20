const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');

router.route('/')
    .all(authController.protect,
    // authController.isSubscription('virtuve'),
    // authController.verifyRoles(roles.admin),
    // videoController.getKitchenVideo
    )
    .get(profileController.getAllUserPlans);

module.exports = router;