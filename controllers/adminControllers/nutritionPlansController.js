const db = require('../../database/db');
const fs = require('fs');
const path = require('node:path');
// const { trys_lentos }  = require('../../utils/sqlQueries');
const { validationResult } = require('express-validator');

// exports.getPlans = async (req, res) => {
//     var queryString = fs.readFileSync(path.join(__dirname, '../', '../', 'database', 'queries.sql')).toString();
//     var result = queryString.split('-- myselect');
    
//     try {
//         const data = await db.query(trys_lentos, ['7e5eca39-9f96-4e1d-b6b2-7972ca583cb9']);
//         res.status(200).json({
//             data: data.rows
//         });
//     } catch (err) {
//         console.log(err.message)
//     }
// };

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
        
        let {title, proteins, carbs, fat, category, sub_category} = req.body;
        if(sub_category === 'null') sub_category = null;
        title = title.trim();
        proteins = proteins.replace(',', '.');
        carbs = carbs.replace(',', '.')
        fat = fat.replace(',', '.')
        
        const data = await db.query('INSERT INTO food_products(title, proteins, carbs, fat, category, sub_category) values($1, $2, $3, $4, $5, $6) RETURNING id;', [title, proteins, carbs, fat, category, sub_category]);
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
        await db.query(`UPDATE food_products SET ${prodCell} = $1 WHERE id = $2;`, [value, prodId]);
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
    var queryString = fs.readFileSync(path.join(__dirname, '../', '../', 'database', 'queries.sql')).toString();
    queryString = queryString.match(/--GET-ALL-MEALS-SELECT-START([\s\S]*?)--GET-ALL-MEALS-SELECT-END/)[1];
    
    try {
        const { rows: data } = await db.query(queryString);
        res.status(200).json(data);
    } catch (err) {
        console.log(err.message)
    }
};

exports.addMeal = async (req, res) => {
    try {
        const {meal_id, column, value} = req.body;
        const { rows } = await db.query(`INSERT INTO food_meals (title, logic) VALUES($1, $2) RETURNING id`, ['-', 'A+B']);
        
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
        const { meal_id } = req.body;
        const default_new_prod_id = '204726c7-a05a-409a-9476-aeff78d138e8';
        const data = await db.query('INSERT INTO food_meal_products(meal_id, product_id) values($1, $2) RETURNING id, product_id;', [meal_id, default_new_prod_id]);
        
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
            // data: req.app.locals
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