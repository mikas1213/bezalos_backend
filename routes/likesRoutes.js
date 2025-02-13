const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const likesController = require('../controllers/likesController');

router.route('/video').post(
    authController.protect, 
    authController.isSubscription('virtuve', 'Virtuvė'),
    likesController.protectDeleteLike,
    likesController.toggleLikes
);

router.route('/recipe').post(
    authController.protect, 
    likesController.protectDeleteLike,
    likesController.toggleLikes
);

module.exports = router;