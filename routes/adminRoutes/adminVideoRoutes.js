const express = require('express');
const router = express.Router();
const roles = require('../../config/roles');
const addVideoValidator = require('../../middleware/validators/addVideoValidator');
const multerController = require('../../controllers/multerDataController');
const authController = require('../../controllers/authController');
const videoController = require('../../controllers/videoController');
const { validateUUID } = require('../../middleware/validators/validate_uuid');

router.use(authController.protect, authController.verifyRoles(roles.admin));

router
	.route('/videos/:id')
	.post(
		multerController.uploadFiles,
		multerController.resizePhotoDisk,
		validateUUID,
		addVideoValidator.addVideoFormValidator,
		videoController.updateVideo,
	);
// .delete(validateUUID, videoController.deleteVideo);

// router
// 	.route('/videos')
// 	.get(videoController.getVideosAdmin)
// 	.post(
// 		multerController.uploadFiles,
// 		multerController.resizePhotoDisk,
// 		addVideoValidator.addVideoFormValidator,
// 		addVideoValidator.addVideoFilesValidator,
// 		videoController.addVideo,
// 	);

module.exports = router;
