const BaseRepository = require('./BaseRepository');
const { DatabaseError } = require('../utils/errors');

class ServicesRepository extends BaseRepository {
    constructor(db) {
        const mappings = { 'is_active': 'is_active' };
        super(db, 'services', mappings);
    }

    async findAllAdmin() {
        const queryString = `SELECT id, base_price, current_price, details, discount, grid_desc, basic_desc, image_s, image_m,
            CASE 
                WHEN popular = true THEN 'On' 
                ELSE 'Off' 
            END AS popular,
            CASE 
                WHEN is_active = true THEN 'On' 
                ELSE 'Off' 
            END AS is_active,

            quantity, slug, sort, title, updated_at, created_at
            FROM services ORDER BY sort ASC`;

        try {
            const data = await this.db.query(queryString);
            return data || null;
        } catch(err) {
            throw new DatabaseError(err.message);
        }
    };
}

module.exports = ServicesRepository;