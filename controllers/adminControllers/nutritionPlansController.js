const db = require('../../database/db');
const { validationResult } = require('express-validator');
const Meal = require('../../Models/Meal');
const Plan = require('../../Models/Plan');

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
        const { rows } = await db.query(queryString, queryParams);
        res.status(200).json(rows);
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
        console.log(req.body)
        let {title, proteins, carbs, fat, category, sub_category, group, intolerance} = req.body;
        console.log(req.body)
        title = title.trim();
        proteins = proteins.replace(',', '.');
        carbs = carbs.replace(',', '.')
        fat = fat.replace(',', '.')
        
        const data = await db.query('INSERT INTO food_products(title, proteins, carbs, fat, category, sub_category, "group", intolerance) values($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;', [title, proteins, carbs, fat, category, sub_category, group, intolerance]);
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
        await db.query(`UPDATE food_products SET "${prodCell}" = $1, updated_at = $3 WHERE id = $2;`, [value, prodId, new Date().toLocaleString('lt-LT')]);
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
    
    let {search = '', logic = '', is_gluten = false, is_lactose = false} = req.query;
    const queryParams = [`%${search.toLowerCase()}%`, `%${logic}%`];
    const queryString = Meal.getAllMealsQuery(is_gluten, is_lactose);
    
    try {
        const { rows }  = await db.query(queryString, queryParams);
        res.status(200).json(rows);
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

/* --FOOD_PLANS CONTROLLERS-- */
exports.getAllPlans = async (req, res) => {
    let { meal_count = 0, is_vegetarian = false, search = ''} = req.query;
    is_vegetarian = is_vegetarian === 'true' ? true : false;
    
    const queryParams = is_vegetarian ? [`%${search.toLowerCase()}%`, meal_count, is_vegetarian] : [`%${search.toLowerCase()}%`, meal_count];
    try {
        const { rows } = await db.query(Plan.getAllPlansQuery(meal_count, is_vegetarian), queryParams);
        res.status(201).json(rows);
    } catch (err) {
        return res.status(400).json({ message: err.message});
    }
};

exports.addPlan = async (req, res) => {
    try {
        const data = await db.query('INSERT INTO food_plans DEFAULT VALUES RETURNING id');
        const id = data.rows[0].id;
        
        res.status(201).json({
            status: 'success',
            message: 'New plan was successfully added!',
            id
        });
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
};

exports.editPlan = async (req, res) => {
    try {
        const {plan_id, column, value} = req.body;
        await db.query(`UPDATE food_plans SET ${column} = $2, updated_at = $3 WHERE id = $1`, [plan_id, value, new Date().toLocaleString('lt-LT')]);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.body;
        await db.query(`DELETE from food_plans WHERE id = $1`, [id]);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

exports.addPlanMeals = async (req, res) => {
    
    try {
        const {plan_id, meal_id, is_sport} = req.body;
        const { rows } = await db.query(`INSERT INTO food_plan_meals(plan_id, meal_id, is_sport) VALUES ($1, $2, $3) RETURNING id`, [plan_id, meal_id, is_sport]);

        res.status(201).json({
            status: 'success',
            message: 'Meal was successfuly added',
            id: rows[0].id
        });
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

/* --MANAGE PLAN CONTROLLERS-- */
exports.getPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query(Plan.getPlanQuery(), [id]);
        res.status(200).json(rows[0]);
    } catch (err) {
        console.log(err.message)
    }
};

/* --ASSIGN PLAN CONTROLLERS-- */
exports.assignPlan = async (req, res) => {
    try {
        
        /* ---I-N-S-E-R-T-I-N-G---P-L-A-N--- */
        const {user_id, plan} = req.body;
        const insertPlanQuery = 'INSERT INTO user_plans (user_id, title) VALUES ($1, $2) RETURNING id';
        await db.query('BEGIN');
        const { rows: plan_row } = await db.query(insertPlanQuery, [user_id, plan.title]);
        
        /* ---I-N-S-E-R-T-I-N-G---M-E-A-L-S--- */
        let mealDate = new Date();
        const plan_id = plan_row[0].id;
        const insertMealsQuery = 'INSERT INTO user_meals (plan_id, title, logic, intolerance, is_sport, meal_time, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id';

        for(const meal of plan.meals) {
            mealDate.setSeconds(mealDate.getSeconds() + 1);
            const { rows: meal_row } = await db.query(insertMealsQuery, [plan_id, meal.title, meal.logic, meal.intolerance, meal.is_sport, meal.meal_time, mealDate.toLocaleString('lt-LT')]);
            
            /* ---I-N-S-E-R-T-I-N-G---P-R-O-D-U-C-T-S--- */
            let prodDate = new Date();
            const meal_id = meal_row[0].id;
            const insertProdQuery = 'INSERT INTO user_products (plan_id, meal_id, title, category, sub_category, b_100, a_100, r_100, grams, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
            for(const prod of meal.products.filter(prod => !prod.is_sport)) {
                prodDate.setSeconds(prodDate.getSeconds() + 1);
                await db.query(insertProdQuery, [plan_id, meal_id, prod.title, prod.category, prod.sub_category, prod.b_100, prod.a_100, prod.r_100, prod.grams, prodDate.toLocaleString('lt-LT')]);
            }
        }

        await db.query('COMMIT');

        res.status(200).json({
            status: 'success'
        });
    } catch (err) {
        
        await db.query('ROLLBACK');
        res.status(500).json({
            message: err.message
        })
    }
};
