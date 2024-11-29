const db = require('../../database/db');

exports.getAllRows = (table, field = 'created_at', sort = 'DESC') => {
    return async (req, res) => {
        try {
            const data = await db.query(`SELECT * FROM ${table} ORDER BY ${field} ${sort};`);
            res.status(200).json({
                [`${table}`]: data.rows
            });
        } catch (err) {
            console.log(err.message)
        }
    };
}

exports.getStats = async (req, res) => {
    try {
        const data = await db.query(`SELECT 
            (SELECT COUNT(*) FROM users WHERE role = 2324) AS users,
            (SELECT COUNT(*) FROM mailer_list) AS mailer_list_mails,
            (SELECT COUNT(*) FROM offers) AS offer_mails,
            (SELECT count(*) from users WHERE subscription_type = 'Virtuvė' AND role = 2324) AS virtuve_active,
            (SELECT count(*) from users WHERE subscription_type = 'Profilis' AND role = 2324) AS profilis_active,
            (SELECT count(*) from food_plans) AS plans,
            (SELECT count(*) from food_meals) AS meals,
            (SELECT count(*) from food_products) AS products;
        `);
        
        res.status(200).json(data.rows[0]);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};