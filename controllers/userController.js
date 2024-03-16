const db = require('../database/db');

exports.getAllUsers = async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM users;');
        res.status(200).json({
            users: data.rows
        })
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};