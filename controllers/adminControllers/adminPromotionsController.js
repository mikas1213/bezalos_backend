const db = require('../../database/db');

exports.addPromoCode = async (req, res) => {
    try {
        const fields = ['promo_code', 'promo_type', 'usage_limit', 'promo_value', 'valid_until', 'specific_products'];

        const query_values = fields.map(f => req.body[f]);
        const query_fields = fields.map(f => `${f}`).join(', ');
        const query_params = query_values.map((f, i) => `$${i+1}`).join(', ');
        const query_string = `INSERT INTO promotions(${query_fields}) VALUES(${query_params})`;

        await db.query(query_string, query_values);
        
        res.sendStatus(200);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};


exports.updatePromoCode = async (req, res) => {
    try {

    } catch(err) {
        
    }
};

exports.deletePromoCode = async (req, res) => {
    try {

    } catch(err) {
        
    }
};
