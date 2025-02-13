const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const videoController = require('../controllers/videoController');

router.route('/').get(
    videoController.getKitchenVideos
);

router.route('/:video').get(
    authController.protect,
    authController.isSubscription('virtuve', 'Virtuvė'),
    videoController.getKitchenVideo
);

router.route('/comment').post(
    authController.protect,
    authController.isSubscription('virtuve', 'Virtuvė'),
    videoController.addVideoComment
);

router.route('/comment/:id/:user_id').delete(
    authController.protect,
    authController.isSubscription('virtuve', 'Virtuvė'),
    videoController.deleteVideoComment
);

module.exports = router;