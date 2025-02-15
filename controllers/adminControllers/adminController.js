const db = require('../../database/db');

exports.getAllRows = (table, field = 'created_at', sort = 'DESC') => {
    return async (req, res) => {
        try {
            const { rows } = await db.query(`SELECT * FROM ${table} ORDER BY ${field} ${sort};`);
            res.status(200).json(rows);
        } catch (err) {            
            res.status(500).json({message: err.message});
        }
    };
}

exports.deleteOneRow = (table, id) => {
    return async (req, res) => {
        try {
            await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({
                message: err.message
            });
        }
    };
};

exports.getStats = async (req, res) => {
    try {
        const data = await db.query(`SELECT 
            (SELECT COUNT(*)::INTEGER FROM users WHERE role = 2324) AS users,
            (SELECT COUNT(*)::INTEGER FROM mailer_list) AS mailer_list_mails,
            (SELECT COUNT(*)::INTEGER FROM offers) AS offer_mails,
            (SELECT COUNT(*)::INTEGER from users WHERE subscription_type = 'Virtuvė' AND role = 2324) AS virtuve_active,
            (SELECT COUNT(*)::INTEGER from users WHERE subscription_type = 'Profilis' AND role = 2324) AS profilis_active,
            (SELECT COUNT(*)::INTEGER from food_plans) AS plans,
            (SELECT COUNT(*)::INTEGER from food_meals) AS meals,
            (SELECT COUNT(*)::INTEGER from food_products) AS products;
        `);
        
        res.status(200).json(data.rows[0]);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};