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
