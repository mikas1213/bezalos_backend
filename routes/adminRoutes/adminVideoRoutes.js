const express = require('express');
const router = express.Router();
const roles = require('../../config/roles');
const authController = require('../../controllers/authController');
const videoController = require('../../controllers/videoController');
const { validateUUID } = require('../../middleware/validators/validate_uuid');

router.use(authController.protect, authController.verifyRoles(roles.admin));

// router.route('/services/add')
//     .post(
//         multerDataController.uploadPhoto,
//         multerDataController.resizePhoto, 
//         fillFormValidator,
//         servicesController.addService
//     );

router.route('/videos/:id')
    // .patch(
    //     multerDataController.uploadPhoto,
    //     multerDataController.resizePhoto, 
    //     validateUUID,
    //     fillFormValidator,
    //     servicesController.updateService
    // )
    .delete(validateUUID, videoController.deleteVideo)

router.route('/videos').get(videoController.getVideosAdmin);

module.exports = router;