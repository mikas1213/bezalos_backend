const roles = require('../utils/roles');
const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipesController');

router.route('/:slug').get(
    recipesController.getOneRecipe
);

router.route('/').post(
    recipesController.getAllRecipes
);

module.exports = router;