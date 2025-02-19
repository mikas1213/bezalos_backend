const roles = require('../utils/roles');
const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipesController');

router.route('/favorite').get(
    recipesController.getFavoriteRecipes
);

router.route('/').post(
    recipesController.getAllRecipes
);

router.route('/:slug').get(
    recipesController.getOneRecipe
);



module.exports = router;