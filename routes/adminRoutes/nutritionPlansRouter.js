const express = require('express');
const router = express.Router();
const nutritionPlansController = require('../../controllers/adminControllers/nutritionPlansController');

router.route('/plans').get(
    // authController.protect,
    // authController.verifyRoles(roles.admin),
    nutritionPlansController.getPlans
);

module.exports = router;