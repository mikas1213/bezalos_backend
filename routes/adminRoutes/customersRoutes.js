const express = require('express');
const router = express.Router();
const roles = require('../../config/roles');
const authController = require('../../controllers/authController');
const adminControllers = require('../../controllers/adminControllers/adminController');
const customersController = require('../../controllers/adminControllers/customersController');
const { validateUUID } = require('../../middleware/validators/validate_uuid');

router.route('/user/plan/:id')
    .all(
        authController.protect,
        authController.verifyRoles(roles.admin)
    ).patch(validateUUID, customersController.updateUserPlan);

router.route('/user/:id')
    .all(authController.protect, authController.verifyRoles(roles.admin))
    .get(validateUUID, customersController.getOneUser)
    .patch(customersController.updateUser);

router.route('/users')
    .all(authController.protect, authController.verifyRoles(roles.admin))
    .get(customersController.searchUsers)
    .post(customersController.getAllUsers);

router.route('/stats').get(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminControllers.getStats
);

router.route('/emails').get(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminControllers.getAllRows('emails')
);

module.exports = router;