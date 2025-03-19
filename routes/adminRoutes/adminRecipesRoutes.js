const express = require('express');
const router = express.Router();
const roles = require('../../config/roles');
const { validateUUID } = require('../../middleware/validators/validate_uuid');
const authController = require('../../controllers/authController');
const multerDataController = require('../../controllers/multerDataController');
const recipesController = require('../../controllers/recipesController');

router.use(authController.protect, authController.verifyRoles(roles.admin));
router.route('/recipes').get(recipesController.getRecipes);

router.route('/recipes/:id')
    .patch(
        validateUUID, 
        multerDataController.uploadPhoto,
        multerDataController.resizePhoto,
        recipesController.editRecipe)
    .delete(validateUUID, recipesController.deleteRecipe);

router.route('/recipes/add')
    .post(
        multerDataController.uploadPhoto,
        multerDataController.resizePhoto,
        recipesController.addRecipe
    );

module.exports = router;