const roles = require('../utils/roles');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const recipesController = require('../controllers/recipesController');

router.route('/:slug').get(
    recipesController.getOneRecipe
);

router.route('/add').all(
    authController.protect,
    authController.verifyRoles(roles.admin)
).post(
    recipesController.uploadPhoto,
    recipesController.resizePhoto,
    recipesController.addRecipe
);

router.route('/').post(
    recipesController.getAllRecipes
);

module.exports = router;