const db = require('../../database/db');
const slugify = require('slugify');

const fillFormValidator = async (req, res, next) => {
    
    const allow_fields = ['id', 'title', 'slug', 'base_price', 'current_price', 'quantity', 'discount', 'sort', 'popular', 'is_active', 'image_s', 'image_m', 'image_l', 'grid_desc', 'basic_desc', 'details', 'created_at', 'updated_at'];
    let { title, base_price = '', quantity, discount = '0', sort, popular, is_active } = req.body;
    base_price = base_price.replace(',', '.');
    quantity = parseInt(quantity);
    sort = parseInt(sort);
    discount = discount.replace(',', '.');
    discount = parseFloat(discount);
    
    const bodyKeys = Object.keys(req.body);
    const invalideFields = bodyKeys.filter(field => !allow_fields.includes(field));
    
    if(invalideFields.length > 0) {
        return res.status(400).json({ message: 'There are unsupported fields' });
    }
    if(!req.body.title) {
        return res.status(400).json({ message: 'Reikalingas pavadinimas' });
    }

    const slug = slugify(title, {replacement: '-', lower: true, trim: true, strict: true });        
    const check_slug_query = 'SELECT 1 FROM services WHERE slug = $1';
    const slug_exists = await db.query(check_slug_query, [slug]);

    if(slug_exists.rowCount > 0 && req.method === 'POST') {
        return res.status(400).json({ message: 'Toks pavadinimas jau yra 🍽' });
    }

    if(!base_price) {
        return res.status(400).json({ message: 'Trūksta kainos €€€' });
    }

    if(isNaN(base_price) || isNaN(quantity) || isNaN(discount) || isNaN(sort)) {
        return res.status(400).json({ message: 'Galimi tik skaičiai 1️⃣2️⃣3️⃣' });
    }

    if(+discount > 100) {
        return res.status(400).json({ message: 'Nuolaida negali viršyti 100%' });
    }

    if(+discount < 0) {
        return res.status(400).json({ message: 'Nuolaida turi būti teigiamas skaičius'});
    }
    
    if(!req.file && req.method === 'POST') {
        return res.status(400).json({ message: 'Nope, reik fotkės! 🏞' });
    }

    req.body.base_price = base_price;
    req.body.quantity = quantity;
    req.body.sort = sort;
    req.body.discount = discount;
    req.body.popular = popular === 'On';
    req.body.is_active = is_active === 'On';
    req.body.slug = slug;
    next();
};

module.exports = { fillFormValidator };
