const express = require('express');
const router = express.Router();
const anthropicController = require('../../controllers/adminControllers/anthropicController');
const authController = require('../../controllers/authController');

// router.use(authController.protect, authController.verifyRoles(roles.admin));
router.route('/').get(anthropicController.anthropicApi);

module.exports = router;