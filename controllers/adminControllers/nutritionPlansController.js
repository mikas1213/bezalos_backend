const db = require('../../database/db');
const fs = require('fs');
const path = require('node:path');
const { validationResult } = require('express-validator');
const Meal = require('../../Models/Meal');

/* --PRODUCTS CONTROLLERS-- */
exports.getAllProducts = async (req, res) => {
    const {search = '', filter = ''} = req.query;
    
    let queryParams = [];
    let queryString = 'SELECT * from food_products ORDER BY title ASC';

    if(search) {
        queryString = 'SELECT * from food_products WHERE LOWER(title) LIKE LOWER($1) ORDER BY title ASC';
        queryParams[0] = `%${search}%`;
    } else if(filter) {
        queryString = 'SELECT * from food_products WHERE category = $1 ORDER BY title ASC';
        queryParams[0] = `${filter}`;
    }

    try {
        const data = await db.query(queryString, queryParams);
        res.status(200).json({
            data: data.rows
        });
    } catch (err) {
        console.log(err.message)
    }
};

exports.addProduct = async (req, res) => {
    const errors = validationResult(req);
    
    try {
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.errors });
        }
        
        let {title, proteins, carbs, fat, category, sub_category, intolerance} = req.body;
        console.log(req.body)
        title = title.trim();
        proteins = proteins.replace(',', '.');
        carbs = carbs.replace(',', '.')
        fat = fat.replace(',', '.')
        
        const data = await db.query('INSERT INTO food_products(title, proteins, carbs, fat, category, sub_category, intolerance) values($1, $2, $3, $4, $5, $6, $7) RETURNING id;', [title, proteins, carbs, fat, category, sub_category, intolerance]);
        const id = data.rows[0].id;
        
        res.status(201).json({
            status: 'success',
            message: 'New product successfully added!',
            id
        });
    } catch (err) {
        return res.status(400).json({ errors: [{path: err.message}]});
    }
};

exports.editProduct = async (req, res) => {
    try {
        let {prodId, prodCell, value} = req.body;

        if(['proteins', 'carbs', 'fat'].includes(prodCell)) {
            value = value.replace(',', '.');
        }
        await db.query(`UPDATE food_products SET ${prodCell} = $1, updated_at = $3 WHERE id = $2;`, [value, prodId, new Date().toLocaleString('lt-LT')]);
        res.status(200).json({
            status: 'success',
            data: 'product was updated'
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.deleteProduct = async (req, res) => {
    
    try {
        await db.query('DELETE from food_products WHERE id = $1;', [req.params.id]);
        res.status(201).json({
			status: 'success',
			data: 'video successfuly deleted'
		});
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

/* --MEALS CONTROLLERS-- */
exports.getAllMeals = async (req, res) => {
    const test = new Meal();
    let {search = '', logic = '', is_gluten = false, is_lactose = false} = req.query;
    const queryParams = [`%${search.toLowerCase()}%`, `%${logic}%`];
    const queryString = Meal.getAllMealsQuery(is_gluten, is_lactose);
    
    try {
        const { rows: data } = await db.query(queryString, queryParams);
        res.status(200).json(data);
    } catch (err) {
        console.log(err.message);
    }
};

exports.addMeal = async (req, res) => {
    try {
        const { rows } = await db.query(`INSERT INTO food_meals DEFAULT VALUES RETURNING id`);
        res.status(201).json({
            new_meal_id: rows[0].id
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.editMeal = async (req, res) => {
    try {
        const {meal_id, column, value} = req.body;
        await db.query(`UPDATE food_meals SET ${column} = $1, updated_at = $3 WHERE id = $2`, [value, meal_id, new Date().toLocaleString('lt-LT')]);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.deleteMeal = async (req, res) => {
    try {
        const { meal_id } = req.body;
        await db.query(`DELETE FROM food_meals WHERE id = $1`, [meal_id]);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

/* --MEALS_PRODUCTS CONTROLLERS-- */
exports.addMealProduct = async (req, res) => {
    try {
        const { meal_id, value } = req.body;
        const data = await db.query('INSERT INTO food_meal_products(meal_id, product_id) values($1, $2) RETURNING id;', [meal_id, value]);

        res.status(201).json({
            status: 'success',
            message: 'Products was successfully added',
            data: data.rows[0]
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            errort: 'Product wasn\'t added',
            message: err.message
        });
    }
};

exports.editMealProduct = async (req, res) => {
    
    try {
        let { id, prod_id, grams } = req.body;
        grams ||= 0;
        await db.query(`UPDATE food_meal_products SET product_id = $2, grams = $3, updated_at = $4 WHERE id = $1`, [id, prod_id, grams, new Date().toLocaleString('lt-LT')]);
        res.status(201).json({
            status: 'success',
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.deleteMealProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await db.query(`DELETE FROM food_meal_products WHERE id = $1`, [id]);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};