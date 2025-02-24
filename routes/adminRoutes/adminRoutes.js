const express = require('express');
const router = express.Router();
const roles = require('../../utils/roles');
const recipesController = require('../../controllers/recipesController');
const authController = require('../../controllers/authController');
const adminControllers = require('../../controllers/adminControllers/adminController'); 
const adminServicesController = require('../../controllers/adminControllers/adminServicesController');
const { fillFormValidator } = require('../../middleware/validators/addServiceValidator');

const { validateUUID } = require('../../middleware/validators/validate_uuid');
router.use(authController.protect, authController.verifyRoles(roles.admin));

router.route('/services/add')
    .post(
        recipesController.uploadPhoto,
        recipesController.resizePhoto, 
        fillFormValidator,
        adminServicesController.addService
    );

router.route('/services/:id')
    .patch(
        recipesController.uploadPhoto,
        recipesController.resizePhoto, 
        validateUUID,
        fillFormValidator,
        adminServicesController.updateService
    )
    .delete(validateUUID, adminControllers.deleteOneRow('services'))

router.route('/services')
    .get(adminServicesController.getAdminServices);

module.exports = router;