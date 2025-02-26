const promoFormValidator = async (req, res, next) => {
    const lt_to_en = {
        'Procentai': 'percentage',
        'Eurai': 'fixed'
    }
    const allowed_fields = ['promo_code', 'promo_type', 'usage_limit', 'promo_value', 'valid_until', 'specific_products'];
    const bad_fields = Object.keys(req.body).filter(field => !allowed_fields.includes(field));
    const { promo_code, promo_type, usage_limit, promo_value, valid_until, specific_products } = req.body;

    if(bad_fields.length > 0) {
        return res.status(400).json({message: 'There are unsupported fields'})
    }
    if(!['Procentai', 'Eurai'].includes(promo_type)) {
        return res.status(400).json({ message: 'Netinkamas nuolaidos formatas'});
    }
    if(!promo_code) {
        return res.status(400).json({ message: 'Neįvestas kodas'});
    }
    if(!promo_value) {
        return res.status(400).json({ message: 'Nepasirinkta vertė'});
    }
    if(isNaN(promo_value) || isNaN(usage_limit)) {
        return res.status(400).json({ message: 'Galimi tik skaičiai'});
    }
    if(Number(promo_value) < 0 || Number(usage_limit) < 0) {
        return res.status(400).json({ message: 'Galimi tik teigiami skaičiai'});
    }
    if(promo_type === 'Procentai' && Number(promo_value) > 100) {
        return res.status(400).json({ message: 'Maksimali vertė 100%'});
    }
    if(Number(usage_limit) < 1) {
        return res.status(400).json({ message: 'Minimalus panaudojimų skaičius: 1'});
    }
    if(!valid_until) {
        return res.status(400).json({ message: 'Nepasirinktas galiojimo laikas'});
    }
    req.body.promo_type = lt_to_en[promo_type];
    const uuidArray = specific_products.trim().length > 0 ? specific_products.split(',').map(field => field.trim()) : []
    req.body.specific_products = uuidArray;
    next();
    
}
module.exports = { promoFormValidator };