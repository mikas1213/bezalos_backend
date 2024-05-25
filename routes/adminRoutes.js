const express = require('express');
const router = express.Router();
const roles = require('../utils/roles');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

router.route('/users').get(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminController.getUsers
);

router.route('/user/:id').patch(
    authController.protect,
    authController.verifyRoles(roles.admin),
    adminController.updateUser
);

module.exports = router;