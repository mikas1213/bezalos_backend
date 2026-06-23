const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipesController');

router.route('/:slug').get(recipesController.getRecipe);
router.route('/').post(recipesController.getRecipes);

module.exports = router;
