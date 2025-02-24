const roles = require('../utils/roles');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const recipesController = require('../controllers/recipesController');

router.route('/favorite').get(
    recipesController.getFavoriteRecipes
)

router.route('/:slug').get(
    recipesController.getOneRecipe
);

router.route('/').post(
    recipesController.getAllRecipes
);

module.exports = router;