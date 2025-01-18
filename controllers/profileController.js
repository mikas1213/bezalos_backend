const db = require('../database/db');
const User = require('../Models/User');
const Bodytracking = require('../Models/Bodytracking');
const generateArray = require('../utils/helpers');
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
    const { id: user_id } = req.params;
    const { title, logic, products } = req.body;

    try {
        const insertRecipeQuery = 'INSERT INTO user_recipes (user_id, title, logic) VALUES ($1, $2, $3) RETURNING id';
        await db.query('BEGIN');
        const data = await db.query(insertRecipeQuery, [user_id, title, logic]); 

        let prodDate = new Date();
        const recipe_id = data.rows[0].id;

        const insertProdsQuery = 'INSERT INTO user_recipe_products (recipe_id, product_id, title, proteins, carbs, fat, grams, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
        for(const prod of products) {
            prodDate.setSeconds(prodDate.getSeconds() + 1);
            
            await db.query(insertProdsQuery, [recipe_id, prod.product_id, prod.title, prod.proteins, prod.carbs, prod.fat, prod.grams, prodDate.toLocaleString('lt-LT')]);
        }

        await db.query('COMMIT');
        res.status(200).json({recipe_id});
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({
            message: err.message
        })
    }
};

exports.deleteRecipe = async (req, res) => {
    const { user_id } = req;
    const { id: recipe_id } = req.params;
    
    try {
        const { rows: recipe } = await db.query('SELECT * FROM user_recipes WHERE id = $1', [recipe_id]);
        if(!recipe[0]) {
            throw new Error('Recipe not found')
        }

        if(recipe[0].user_id !== user_id) {
            throw new Error('You do not have permission to that action');
        }


        await db.query('DELETE from user_recipes WHERE id = $1', [recipe_id]);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.getBodyTracking = async (req, res) => {
    const periods = {'1month': 4, '3months': 12, '6months': 24, '1year': 52, 'alltime': 100};
    
    if(!Object.keys(periods).includes(req.query.period)) {
        return res.status(404).json({ message: 'Not Found'})
    }
    const period = periods[req.query.period];
    
    try {
        const { id } = req.params;
        const { rows } = await db.query(Bodytracking.getBodytracking(), [id, period]);
        const { rows: [stats] } = await db.query(Bodytracking.getBodyStats(), [id]);
        const { rows: all_data } = await db.query(Bodytracking.getAllBodyData(), [id]);
        
        if(rows.length === 0) {
            const emptyDataSet = generateArray(period);
            return res.status(200).json({
                rows: emptyDataSet, stats, all_data
            });
        }
        
        res.status(200).json({ rows, stats, all_data });
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};

exports.addBodyTracking = async (req, res) => {
    // const currentDate = new Date(Date.now());
    // const weeksToSubtract = 0;
    // const millisPerWeek = 7 * 24 * 60 * 60 * 1000;
    // const created_at = new Date(currentDate - (weeksToSubtract * millisPerWeek));
    
    try {        
        const { id } = req.params;
        let { svoris, bicepsas, talija, sedmenys, slaunis } = req.body;

        svoris ||= null;
        bicepsas ||= null;
        talija ||= null;
        sedmenys ||= null;
        slaunis ||= null;

        await new Promise(resolve => setTimeout(resolve, 500));
        const { rows: [{ days_left }] } = await db.query(`SELECT 
            GREATEST(0, 7 - (CURRENT_DATE - DATE(MAX(created_at)))) AS days_left
            FROM body_tracking WHERE user_id = $1;`, [id]);

        if(days_left > 0) {
            return res.status(403).json({
                days_left,
                errors: [{path: 'all', msg: `Duomenis atnaujinti galėsite po ${days_left} ${days_left === 1 ? 'dienos' : 'dienų'}`}]
            });
        }
        await db.query('INSERT INTO body_tracking(user_id, svoris, bicepsas, talija, sedmenys, slaunis) VALUES($1, $2, $3, $4, $5, $6)', [id, svoris, bicepsas, talija, sedmenys, slaunis]);
        
        res.status(200).json({
            status: 'success'
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
