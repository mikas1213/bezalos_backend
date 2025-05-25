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
            if(this.filterMapping[key] && !!val) {
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
            throw new DatabaseError(err.message, err)
        }
    }

    async findByField(fieldName, value) {
        try {
            const data = await this.db.query(`SELECT * FROM ${this.tableName} WHERE ${fieldName} = $1`, [value]);
            return data[0] || null;
        } catch(err) {
            throw new DatabaseError(err.message, err);
        }
    };
    async findById(id) {
        return this.findByField('id', id);
    };
    async findBySlug(slug) {        
        return this.findByField('slug', slug);
    };

    async create(data, returningFields = ['id']) {
        try {
            const keys = Object.keys(data).join(', ');
            const values = Object.values(data);
            const params = values.map((_, index) => `$${index+1}`).join(', ');
            const returningClause = returningFields.join(', ');
            const query = `INSERT INTO ${this.tableName} (${keys}) VALUES (${params}) RETURNING ${returningClause}`;
            
            return await this.db.query(query, values);            
        } catch (err) {
            throw new DatabaseError(err.message, err);
        }
    };
    
    async updateById(id, data) {
        try {
            const fields = Object.keys(data);
            const query_values = fields.map(field => data[field]);
            const query_fields = fields.map((field, i) => `${field} = $${i+1}`).join(', ');
            query_values.push(id);
            const query_string = `UPDATE ${this.tableName} SET ${query_fields} WHERE id = $${query_values.length}`;
            return await this.db.query(query_string, query_values);          
        } catch(err) {
            throw new DatabaseError(err.message, err);
        }
    }

    async deleteById(id) {
        try {
            return await this.db.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
        } catch (err) {
            throw new DatabaseError(err.message, err);
        }
    };
}

module.exports = BaseRepository;

