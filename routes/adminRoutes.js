const express = require('express');
const router = express.Router();
const roles = require('../utils/roles');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

// router.route('/users').get(
//     authController.protect,
//     authController.verifyRoles(roles.admin),
//     adminController.getAllUsers
// );

router.route('/users').post(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminController.getAllUsers
);

router.route('/user/:id').patch(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminController.updateUser
);

router.route('/videos').get(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminController.getAllRows('videos')
);

router.route('/offers').get(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminController.getAllRows('offers')
);

router.route('/stats').get(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminController.getStats
);

// router.route('/plans').get(
//     authController.protect,
//     authController.verifyRoles(roles.admin),
//     adminController.getPlans
// );



module.exports = router;