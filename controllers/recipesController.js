const { RECIPES_SERVICE } = require('../config/DIKeys');
const { ValidationError } = require('../utils/errors');
const RecipeDTO = require('../dto/recipe-create.dto');
const appContainer = require('../utils/appContainer');
const recipesService = appContainer.resolve(RECIPES_SERVICE);
const catchAsync = require('../utils/catchAsync');
const slugify = require('slugify');

exports.getFavoriteRecipes = catchAsync(async (req, res) => {
    const data = await recipesService.getFavoriteRecipes();
    res.status(200).json(data);
});

exports.getRecipe = catchAsync(async (req, res) => {
    const { slug } = req.params;
    const data = await recipesService.getRecipeWithProducts(slug);
    res.status(200).json(data);
});

exports.getRecipes = catchAsync(async (req, res) => {
    const user_id = req.body.id;
    const filters = {...req.query};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    
    if (page < 1 || limit < 1 || page > 1000 || limit > 50) {
        throw new ValidationError('Invalid pagination parameters');
    } 
    const data = await recipesService.getAllRecipes(filters, page, limit, user_id);
    res.status(200).json(data);
});

exports.addRecipe = catchAsync(async (req, res) => {
    const recipeDTO = new RecipeDTO(req.body);
    const { products } = req.body;

    if (!recipeDTO.title) throw new ValidationError('Recepto pavadinimas');
    if (!req.file) throw new ValidationError('Nope, reik fotkės! 🏞');
    if(JSON.parse(products).length === 0) throw new ValidationError('O produktai? 🍔🌭🌮');

    const recipe_id = await recipesService.addOneRecipe(recipeDTO, products);
    res.status(200).json(recipe_id);
});

exports.editRecipe = catchAsync(async (req, res) => {
    const { id: recipe_id } = req.params;
    const recipeDTO = new RecipeDTO(req.body);
    const { products } = req.body;
    if (!recipeDTO.title) throw new ValidationError('Recepto pavadinimas');
    if(JSON.parse(products).length === 0) throw new ValidationError('O produktai? 🍔🌭🌮');

    await recipesService.updateOneRecipe(recipe_id, recipeDTO, products);
    res.sendStatus(204);
});

exports.deleteRecipe = catchAsync(async (req, res) => {
    const { id } = req.params;
    await recipesService.deleteOneRecipe(id);
    res.sendStatus(204);
});