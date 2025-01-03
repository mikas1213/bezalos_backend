const db = require('../database/db');

exports.validateDiscountCode = async (req, res) => {
    try {
        const { code } = req.params;
        const { rows } = await db.query(`SELECT * FROM promotions WHERE discount_code = $1`, [code.toUpperCase()]);
        await new Promise((res, rej) => setTimeout(res, 1000))
        if(!rows[0]) {
            return res.status(404).json({ message: 'Šis kodas negalioja.'});
        }
        console.log('validuojam coda', rows)

        res.status(200).json(rows[0]);
    } catch (err) {
        
    }
}