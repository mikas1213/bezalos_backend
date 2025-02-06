const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipesController');

router.route('/:slug').get(
    recipesController.getOneRecipe
);

router.route('/').get(
    recipesController.getAllRecipes
);

module.exports = router;