const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const videoController = require('../controllers/videoController');


router.route('/').get(videoController.getVideos);

router.route('/:video').get(
    authController.protect,
    authController.isSubscription('virtuve', 'Virtuvė'),
    videoController.getVideo
);

module.exports = router;