const db = require('../database/db');

exports.validatePromoCode = async (req, res, next) => {
    const { service_id } = req.body;

    try {
        const { code } = req.params;
        const { rows: [promo] } = await db.query(`SELECT 
            promo_type, 
            promo_value::FLOAT AS promo_value, 
            valid_until, 
            usage_limit, 
            usage_count,
            is_specific_product, 
            specific_products 
        FROM promotions WHERE promo_code = $1`, [code.toUpperCase()]);

        await new Promise((res, req) => setTimeout(res, 500))
        if(!promo) {
            return res.status(404).json({ message: 'Šis kodas neteisingas.'});
        }

        if (promo.valid_until !== null && new Date() > new Date(promo.valid_until)) {
            return res.status(410).json({ message: 'Kodo galiojimas pasibaigęs.' });
        }

        if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit) {
            return res.status(400).json({ message: 'Kodas pasiekė panaudojimo limitą.' });
        }

        if(promo.is_specific_product && !promo.specific_products.includes(service_id)) {
            return res.status(400).json({message: 'Šiai paslaugai kodas negalioja'})
        }
        req.promo = promo;
        next();
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.applyPromoCode = async (req, res) => {

    const { service_price } = req.body;
    const { promo_type, promo_value } = req.promo;

    let discount_amount = promo_value;
    let new_price = service_price - promo_value;

    try {
        if(promo_type === 'percentage') {
            discount_amount = Math.round(service_price * promo_value / 100);
            new_price = Math.round(service_price - discount_amount);
        }

        res.status(200).json({
            new_price,
            discount_amount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};