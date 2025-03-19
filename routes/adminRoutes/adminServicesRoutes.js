const express = require('express');
const router = express.Router();
const roles = require('../../config/roles');
const multerDataController = require('../../controllers/multerDataController');
const authController = require('../../controllers/authController');
const servicesController = require('../../controllers/servicesController');
const { fillFormValidator } = require('../../middleware/validators/addServiceValidator');
const { validateUUID } = require('../../middleware/validators/validate_uuid');

router.use(authController.protect, authController.verifyRoles(roles.admin));
router.route('/services/add')
    .post(
        multerDataController.uploadPhoto,
        multerDataController.resizePhoto, 
        fillFormValidator,
        servicesController.addService
    );

router.route('/services/:id')
    .patch(
        multerDataController.uploadPhoto,
        multerDataController.resizePhoto, 
        validateUUID,
        fillFormValidator,
        servicesController.updateService
    )
    .delete(validateUUID, servicesController.deleteService)

router.route('/services').get(servicesController.getServicesAdmin);

module.exports = router;