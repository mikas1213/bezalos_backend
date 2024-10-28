const db = require('../database/db');
const UserPlan = require('../Models/UserPlan');

exports.getAllUserPlans = async (req, res) => {
    try {
        const { id } = req.query;
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
