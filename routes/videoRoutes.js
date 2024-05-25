const express = require('express');
const router = express.Router();
// const roles = require('../utils/roles');
const authController = require('../controllers/authController');
const videoController = require('../controllers/videoController');

router.route('/').get(
    // authController.protect, 
    videoController.getKitchenVideos
);

router.route('/:video').get(
    authController.protect,
    authController.isSubscription,
    // authController.verifyRoles(roles.admin),
    videoController.getKitchenVideo
);

router.route('/comment').post(
    authController.protect,
    authController.isSubscription,
    videoController.addVideoComment
);

router.route('/comment/:id/:user_id').delete(
    authController.protect,
    authController.isSubscription,
    videoController.protectDelete,
    videoController.deleteVideoComment
);

router.route('/like/:video_id/:user_id').post(
    authController.protect,
    authController.isSubscription,
    videoController.protectDelete,
    videoController.toggleLikes
);

module.exports = router;