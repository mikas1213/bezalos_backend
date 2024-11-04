const db = require('../database/db');
const UserPlan = require('../Models/UserPlan');
exports.getAllUserPlans = async (req, res) => {

    try {
        const { id } = req.params;
        const { rows } = await db.query(UserPlan.getUserPlans(), [id])
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.getAllProfileProducts = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT title, CAST(proteins AS REAL), CAST(carbs AS REAL), CAST(fat AS REAL), category, sub_category FROM food_products ORDER BY title ASC');
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
        const { title, category, sub_category, proteins, carbs, fat } = req.body;
        await db.query(`UPDATE 
            user_products SET title = $3, 
            category = $4, 
            sub_category = $5, 
            b_100 = $6, 
            a_100 = $7, 
            r_100 = $8, 
            updated_at = $9
            WHERE plan_id = $1 AND id = $2
        `, [plan_id, prod_id, title, category, sub_category, proteins, carbs, fat, new Date().toLocaleString('lt-LT')]);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};
