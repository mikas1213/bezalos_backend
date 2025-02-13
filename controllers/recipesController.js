const db = require('../database/db');
const Recipe = require('../Models/Recipe');
const jwt = require('jsonwebtoken');

exports.getAllRecipes = async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit);

        if (page < 1 || limit < 1 || page > 1000 || limit > 50) {
            return res.status(400).json({ message: 'Invalid pagination parameters' });
        } 

        const data = await Recipe.getAllRecipesQuery(req.query, page, limit, req.body.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOneRecipe = async (req, res) => {
    try {
        const { slug } = req.params;
        const recipe = await Recipe.getOneRecipeQuery(slug);

        if (!recipe) {
            return res.status(404).json({ message: 'Receptas nerastas' });
        }

        res.json(recipe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

