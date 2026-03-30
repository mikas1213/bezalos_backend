// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const videoController = require('../controllers/videoController');

// router
// 	.route('/v/:video')
// 	.get(
// 		authController.protect,
// 		authController.isSubscription('virtuve', 'Virtuvė'),
// 		videoController.getVideo,
// 	);

// router
// 	.route('/c/:video')
// 	.get(authController.protect, authController.isCourse, videoController.getVideo);

// router.route('/').get(videoController.getVideos);
// router.route('/:id').post(videoController.updateVideoPlayCount);

// module.exports = router;
