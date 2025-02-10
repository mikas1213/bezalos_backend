const db = require('../database/db');
const Recipe = require('../Models/Recipe');

exports.getAllRecipes = async (req, res) => {
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit);

        if (page < 1 || limit < 1 || page > 1000 || limit > 50) {
            return res.status(400).json({ message: 'Invalid pagination parameters' });
        }

        const data = await Recipe.getAllRecipesQuery(req.query, page, limit);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOneRecipe = async (req, res) => {
    try {
        const { slug } = req.params;
        const recipe = await Recipe.getOneRecipeQuery(slug);
        console.log(recipe)
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.json(recipe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

