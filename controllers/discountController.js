const db = require('../database/db');

exports.validateDiscountCode = async (req, res) => {
    try {
        const { code } = req.params;
        const { rows } = await db.query(`SELECT * FROM promotions WHERE discount_code = $1`, [code.toUpperCase()]);

        await new Promise((res, req) => setTimeout(res, 800))
        if(!rows[0]) {
            return res.status(404).json({ message: 'Šis kodas neteisingas.'});
        }
        if (new Date() > new Date(rows[0].valid_until)) {
            console.log(new Date() > new Date(rows[0].valid_until))
            console.log('validuojam coda', new Date(), rows[0].valid_until);
            console.log('negalioja')
            return res.status(400).json({ message: 'Kodo galiojimas pasibaigęs.' });
        }
        

        res.status(200).json(rows[0]);
    } catch (err) {
        
    }
}