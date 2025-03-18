const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipesController');

router.route('/favorite').get(
    recipesController.getFavoriteRecipes
)

router.route('/:slug').get(
    recipesController.getRecipe
);

router.route('/').post(
    recipesController.getAllRecipes
);

module.exports = router;