const roles = require('../../utils/roles');
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const adminController = require('../../controllers/adminControllers/adminController');
const nutritionPlansController = require('../../controllers/adminControllers/nutritionPlansController');
const { addProductValidators } = require('../../middleware/validators/adminValidators');

router.route('/plans').get(
    authController.protect,
    authController.verifyRoles(roles.admin),
    nutritionPlansController.getPlans
);

router.route('/plans/products')
    .all(authController.protect, authController.verifyRoles(roles.admin))
    .get(nutritionPlansController.getAllProducts)
    .post(addProductValidators, nutritionPlansController.addProduct)
    .patch(addProductValidators, nutritionPlansController.editProduct);

router.route('/plans/products/:id')
    .all(authController.protect, authController.verifyRoles(roles.admin))
    .delete(nutritionPlansController.deleteProduct);
    
module.exports = router;