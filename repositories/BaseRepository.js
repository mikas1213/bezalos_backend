const { DatabaseError } = require('../utils/errors');

class BaseRepository {
    constructor(db, tableName, filterMapping = {}) {
        this.db = db;
        this.tableName = tableName;
        this.filterMapping = filterMapping;
    }

    mapFilter(filters) {
        const dbFilters = {};
        for(const [key, val] of Object.entries(filters)) {
            if(this.filterMapping[key]) {
                dbFilters[this.filterMapping[key]] = val;
            }
        }
        return dbFilters;
    }

    queryBuilder(filters = {}, fields = ['*'], sortOptions = null) {
        
        const values = [];
        const fields_str = fields.join(', ');
        let query = `SELECT ${fields_str} FROM ${this.tableName}`;
        
        if(Object.keys(filters).length > 0) {
            const conditions = Object.keys(filters).map((key, i) => {
                const value = filters[key];
                const index = i + 1;

                if(typeof value === 'boolean') {
                    values.push(value);
                    return `${key} = $${index}`;
                } else {
                    values.push(`%${filters[key]}%`);
                    return `${key} ILIKE $${index}`;
                }
            });
            query += ` WHERE ${conditions.join(' AND ')}`
        } 

        if (sortOptions && sortOptions.field) {
            const direction = sortOptions.direction && (sortOptions.direction.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
            query += ` ORDER BY ${sortOptions.field} ${direction}`;
        }
        
        return { query, values };
    };

    async findAll(filters = {}, fields = ['*'], sortOptions = null) {
        try {
            const mappedFilters = this.mapFilter(filters);
            const { query, values } = this.queryBuilder(mappedFilters, fields, sortOptions);            
            return await this.db.query(query, values);
        } catch (err) {
            throw new DatabaseError(err.message)
        }
    }

    async findByField(fieldName, value) {
        try {
            const data = await this.db.query(`SELECT * FROM ${this.tableName} WHERE ${fieldName} = $1`, [value]);
            return data[0] || null;
        } catch(err) {
            throw new DatabaseError(err.message);
        }
    };
    async findById(id) {
        return this.findByField('id', id);
    };
    
    async findBySlug(slug) {        
        return this.findByField('slug', slug);
    };

    async create(data) {
        try {
            const keys = Object.keys(data).join(', ');
            const values = Object.values(data);
            const params = values.map((_, index) => `$${index+1}`).join(', ');
            const query = `INSERT INTO ${this.tableName} (${keys}) VALUES (${params})`;

            return await this.db.query(query, values);            
        } catch (err) {
            throw new DatabaseError(err.message, err);
        }
    };

    async delete(id) {
        try {
            return await this.db.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
        } catch (err) {
            throw new DatabaseError(err.message, err);
        }
    };
}

module.exports = BaseRepository;