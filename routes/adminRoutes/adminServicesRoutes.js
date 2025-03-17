const express = require('express');
const router = express.Router();
const roles = require('../../config/roles');
const multerDataController = require('../../controllers/multerDataController');
const authController = require('../../controllers/authController');
const adminControllers = require('../../controllers/adminControllers/adminController'); 
const adminServicesController = require('../../controllers/adminControllers/adminServicesController');
const { fillFormValidator } = require('../../middleware/validators/addServiceValidator');
const { validateUUID } = require('../../middleware/validators/validate_uuid');

router.use(authController.protect, authController.verifyRoles(roles.admin));
router.route('/services/add')
    .post(
        multerDataController.uploadPhoto,
        multerDataController.resizePhoto, 
        fillFormValidator,
        adminServicesController.addService
    );

router.route('/services/:id')
    .patch(
        multerDataController.uploadPhoto,
        multerDataController.resizePhoto, 
        validateUUID,
        fillFormValidator,
        adminServicesController.updateService
    )
    .delete(validateUUID, adminServicesController.deleteService)

router.route('/services')
    .get(adminServicesController.getServicesAdmin);

module.exports = router;