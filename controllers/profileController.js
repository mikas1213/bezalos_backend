const db = require('../database/db');
const User = require('../Models/User');

exports.getUserDetails = async (req, res) => {

    try {
        const { id } = req.params;
        const { rows } = await db.query(User.getUserDetailsQuery(), [id]);
        
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.getAllProfileProducts = async (req, res) => {
    try {
        const { rows } = await db.query(`SELECT 
            id, 
            title, 
            CAST(proteins AS REAL), 
            CAST(carbs AS REAL), 
            CAST(fat AS REAL), 
            category, 
            sub_category, 
            food_type 
            FROM food_products 
            -- WHERE NOT(proteins = 0 AND carbs = 0 AND fat = 0)
            ORDER BY title ASC`
        );
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { plan_id, prod_id } = req.params;
        const { title, category, sub_category, proteins, carbs, fat, grams } = req.body;

        await db.query(`UPDATE 
            user_products SET title = $3, 
            category = $4, 
            sub_category = $5, 
            b_100 = $6, 
            a_100 = $7, 
            r_100 = $8, 
            grams = $9,
            updated_at = $10
            WHERE plan_id = $1 AND id = $2`, [plan_id, prod_id, title, category, sub_category, proteins, carbs, fat, grams, new Date().toLocaleString('lt-LT')]);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};

exports.submitAnketa = async (req, res) => {
    
    const { user_id } = req.params;
    try {
        const {
            gender,
            age,
            height,
            weight,
            activity_steps,
            goal,
            schedule,
            feeding,
            feeding_desc,
            health_problems,
            health_problems_desc,
            diet,
            diet_desc,
            intolerance,
            intolerance_desc,
            breakfast,
            breakfast_time,
            breakfast_desc,
            lunch,
            lunch_time,
            lunch_desc,
            snack,
            snack_time, 
            snack_desc, 
            dinner, 
            dinner_time, 
            dinner_desc,
            routines,
            additional_info,
            updated_at
        } = req.body;

        const queryValues = [
            user_id,
            gender,
            age,
            height,
            weight,
            activity_steps,
            goal,
            schedule,
            feeding,
            feeding_desc,
            health_problems,
            health_problems_desc,
            diet,
            diet_desc,
            intolerance,
            intolerance_desc,
            breakfast,
            breakfast_time,
            breakfast_desc,
            lunch,
            lunch_time,
            lunch_desc,
            snack,
            snack_time, 
            snack_desc, 
            dinner, 
            dinner_time, 
            dinner_desc,
            routines,
            additional_info
        ];

        await db.query(User.userAnketaUpsertQuery(), queryValues);
        res.status(200).json(req.body);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.saveNewRecipe = async (req, res) => {
    const { user_id } = req.params;
    const { title, products } = req.body;

    try {
        const insertRecipeQuery = 'INSERT INTO user_recipes (user_id, title) VALUES ($1, $2) RETURNING id';
        await db.query('BEGIN');
        const data = await db.query(insertRecipeQuery, [user_id, title]); 

        let prodDate = new Date();
        const recipe_id = data.rows[0].id;

        const insertProdsQuery = 'INSERT INTO user_recipe_products (recipe_id, product_id, title, proteins, carbs, fat, grams, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
        for(const prod of products) {
            prodDate.setSeconds(prodDate.getSeconds() + 1);
            
            await db.query(insertProdsQuery, [recipe_id, prod.product_id, prod.title, prod.proteins, prod.carbs, prod.fat, prod.grams, prodDate.toLocaleString('lt-LT')]);
        }

        await db.query('COMMIT');
        res.sendStatus(200);
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({
            message: err.message
        })
    }
};