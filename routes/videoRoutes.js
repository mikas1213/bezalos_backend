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

router.route('/comment').post(
    authController.protect,
    authController.isSubscription,
    videoController.addVideoComment
);

router.route('/comment/:id').delete(
    // authController.protect,
    // authController.isSubscription,
    videoController.deleteVideoComment
);

module.exports = router;