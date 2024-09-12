const express = require('express');
const router = express.Router();
const roles = require('../../utils/roles');
const authController = require('../../controllers/authController');
const adminControllers = require('../../controllers/adminControllers/adminController');
const customersController = require('../../controllers/adminControllers/customersController');

router.route('/users').post(
    authController.protect,
    authController.verifyRoles(roles.admin),
    customersController.getAllUsers
);

router.route('/user/:id').patch(
    authController.protect,
    authController.verifyRoles(roles.admin),
    customersController.updateUser
);

router.route('/videos').get(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminControllers.getAllRows('videos')
);

router.route('/stats').get(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminControllers.getStats
);

router.route('/offers').get(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminControllers.getAllRows('offers')
);



module.exports = router;