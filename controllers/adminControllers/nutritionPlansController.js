const db = require('../../database/db');
const fs = require('fs');
const path = require('node:path');
const { trys_lentos }  = require('../../utils/sqlQueries');
const { validationResult } = require('express-validator');

exports.getPlans = async (req, res) => {
    var queryString = fs.readFileSync(path.join(__dirname, '../', '../', 'database', 'queries.sql')).toString();
    var result = queryString.split('-- myselect');
    
    try {
        const data = await db.query(trys_lentos, ['7e5eca39-9f96-4e1d-b6b2-7972ca583cb9']);
        res.status(200).json({
            data: data.rows
        });
    } catch (err) {
        console.log(err.message)
    }
};

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
            console.log('yra')
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