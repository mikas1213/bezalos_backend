const roles = require('../../utils/roles');
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const adminController = require('../../controllers/adminControllers/adminController');
const nutritionPlansController = require('../../controllers/adminControllers/nutritionPlansController');
const { addProductValidators } = require('../../middleware/validators/adminValidators');

router.route('/plans').all(authController.protect, authController.verifyRoles(roles.admin))
    .get(nutritionPlansController.getAllPlans)
    .post(nutritionPlansController.addPlan)
    .patch(nutritionPlansController.editPlan)
    .delete(nutritionPlansController.deletePlan);

router.route('/plans/plan/meals').all(authController.protect, authController.verifyRoles(roles.admin))
    .post(nutritionPlansController.addPlanMeals)

router.route('/plans/products')
    .all(authController.protect, authController.verifyRoles(roles.admin))
    .get(nutritionPlansController.getAllProducts)
    .post(addProductValidators, nutritionPlansController.addProduct)
    .patch(addProductValidators, nutritionPlansController.editProduct);

router.route('/plans/products/:id')
    .all(authController.protect, authController.verifyRoles(roles.admin))
    .delete(nutritionPlansController.deleteProduct);

router.route('/plans/meals')
    .all(authController.protect, authController.verifyRoles(roles.admin))
    .get(nutritionPlansController.getAllMeals)
    .post(nutritionPlansController.addMeal)
    .patch(nutritionPlansController.editMeal)
    .delete(nutritionPlansController.deleteMeal);
    
router.route('/plans/meal/product')
    .all(authController.protect, authController.verifyRoles(roles.admin))
    .post(nutritionPlansController.addMealProduct)
    .patch(nutritionPlansController.editMealProduct)
    .delete(nutritionPlansController.deleteMealProduct);


module.exports = router;