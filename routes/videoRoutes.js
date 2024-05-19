const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const videoController = require('../controllers/videoController');

router.route('/').get(
    // authController.protect, 
    videoController.getKitchenVideos
);

router.route('/:video').get(
    authController.protect,
    authController.isSubscription,
    videoController.getKitchenVideo
);

router.route('/add_comment').post(
    // authController.protect,
    videoController.addVideoComment
);

module.exports = router;