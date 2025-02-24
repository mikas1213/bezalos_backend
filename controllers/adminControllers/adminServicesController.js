const db = require('../../database/db');

exports.getAdminServices = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM services ORDER BY sort ASC');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.addService = async (req, res) => {

    try {
        const { title, slug, base_price, quantity, discount, sort, popular, is_active, image_s, image_m, image_l, grid_desc, basic_desc, details } = req.body;
        await db.query('INSERT INTO services (title, slug, base_price, quantity, discount, sort, popular, is_active, image_s, image_m, image_l, grid_desc, basic_desc, details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)', [title, slug, base_price, quantity, discount, sort, popular, is_active, image_s, image_m, image_l, grid_desc, basic_desc, details]);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};

exports.updateService = async (req, res) => {    
    try {
        const { id } = req.params;
        const fields = ['title', 'slug', 'base_price', 'quantity', 'discount', 'sort', 'popular', 'is_active', 'grid_desc', 'basic_desc', 'details'];

        if(req.file) {
            ['image_s', 'image_m', 'image_l'].forEach(field => fields.push(field));
        }

        const query_values = fields.map(field => req.body[field]);
        const query_fields = fields.map((field, i) => `${field} = $${i+1}`).join(', ');
        query_values.push(id);
        const query_string = `UPDATE services SET ${query_fields} WHERE id = $${query_values.length}`;
        
        await db.query(query_string, query_values);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};

