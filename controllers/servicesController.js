const db = require('../database/db');
// const User = require('../Models/User');

exports.getAllServices = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM services ORDER BY sort ASC');
        
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};

exports.getOneService = async (req, res) => {
    const { slug } = req.params;
    try {
        const { rows } = await db.query('SELECT * FROM services WHERE slug = $1', [slug]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};