const db = require('../database/db');

exports.getUsers = async (req, res, next) => {
    try {
        const data = await db.query('SELECT * from users ORDER BY subscription_expires ASC;');
        res.status(200).json({
            users: data.rows
        });
    } catch (err) {
        console.log(err.message);
    }
};