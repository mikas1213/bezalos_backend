const db = require('../database/db');

class Recipe {
    static buildWhereClause(filters) {
        const where = [];
        const values = [];
        let paramCount = 1;
        const searchableColumns = ['r.title', 'r.description', 'p.title']; 
        const ALLOWED_FILTERS = ['is_vegetarian', 'recipe_type', 'logic', 'duration', 'taste', 'search'];
        const validFilters = Object.keys(filters)
            .filter(key => ALLOWED_FILTERS.includes(key))
            .reduce((obj, key) => {
                obj[key] = filters[key];
                return obj;
            }, {});

        for (const [key, value] of Object.entries(validFilters)) {
            if (value !== undefined && value !== '') {
                if (key === 'search') {
                    if (typeof value !== 'string' || value.length > 255) {
                        continue; 
                    }
                    const searchConditions = searchableColumns.map(col => `${col} ILIKE $${paramCount}`);
                    where.push(`(${searchConditions.join(' OR ')})`);
                    values.push(`%${value}%`); 
    
                } else if(key === 'is_vegetarian' && value === 'Be mėsos') {
                    where.push(`${key} = $${paramCount}`);
                    values.push(true); 
    
                } else if(key === 'duration') {
                    let nuo = 0;
                    let iki = 0;
                    if(value === 'Iki 15min.') { iki = 15; }
                    if(value === '15-30min.') { nuo = 16; iki = 30; }
                    if(value === '30-60min.') { nuo = 31; iki = 60; }
                    if(value === 'Virš 60min.') { nuo = 61; iki = 600; }
    
                    where.push(`duration BETWEEN $${paramCount} AND $${paramCount + 1}`);
                    values.push(nuo, iki);
                    paramCount++; 
                } else {
                    where.push(`${key} = $${paramCount}`);
                    values.push(value);
                }
                paramCount++;
            }
        }
        return {
            whereClause: where.length ? 'WHERE ' + where.join(' AND ') : '',
            values
        }
    }

    static async getAllRecipesQuery(filters, page = 1, limit = 16) {
        
        const { whereClause, values } = this.buildWhereClause(filters);
        const offset = (page - 1) * limit;
        // const countQuery = `SELECT COUNT(*) AS total FROM recipes r ${whereClause};`;

        const countQuery = `
            SELECT COUNT(DISTINCT r.id) AS total 
            FROM recipes r
            LEFT JOIN recipe_products rp ON rp.recipe_id = r.id
            LEFT JOIN food_products p ON rp.product_id = p.id
            ${whereClause};
        `;


        const queryString = `
            SELECT 
                r.id,
                r.title AS recipe, 
                r.slug, 
                r.img, 
                r.is_vegetarian,
                r.logic,
                r.recipe_type,
                r.duration,
                r.taste,
                r.description,
                COALESCE(SUM((p.proteins / 100) * rp.grams), 0)::float AS b,
                COALESCE(SUM((p.carbs / 100) * rp.grams), 0)::float AS a,
                COALESCE(SUM((p.fat / 100) * rp.grams), 0)::float AS r,
                COALESCE(SUM(((p.proteins * 4) + (p.carbs * 4) + (p.fat * 9)) / 100 * rp.grams), 0)::float AS kcal
            FROM recipe_products rp
            LEFT JOIN recipes r ON rp.recipe_id = r.id
            LEFT JOIN food_products p ON rp.product_id = p.id
            ${whereClause}
            GROUP BY r.id ORDER BY r.title ASC
            LIMIT $${values.length + 1} OFFSET $${values.length + 2};
        `;
        
        try {
            const count_result = await db.query(countQuery, values);
            const total_rows = parseInt(count_result.rows[0].total, 10);
            const total_pages = Math.ceil(total_rows / limit);
            values.push(limit, offset);
            const { rows } = await db.query(queryString, values);

            return {rows, total_pages, total_rows, current_page: page};
        } catch (err) {
            throw err;
        }
    }

    static async getOneRecipeQuery(slug) {
        const queryString = `
            SELECT 
                r.title AS recipe, 
                r.slug, 
                r.img, 
                r.is_vegetarian,
                r.logic,
                r.recipe_type,
                r.duration,
                r.taste,
                r.description,
                COALESCE(ROUND(SUM((p.proteins / 100) * rp.grams))::FLOAT, 0) AS b,
                COALESCE(ROUND(SUM((p.carbs / 100) * rp.grams))::FLOAT, 0) AS a,
                COALESCE(ROUND(SUM((p.fat / 100) * rp.grams))::FLOAT, 0) AS r,
                COALESCE(ROUND(SUM(((p.proteins * 4) + (p.carbs * 4) + (p.fat * 9)) / 100 * rp.grams))::FLOAT, 0) AS kcal,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', rp.id, 
                        'product_id', p.id,
                        'title', p.title,
                        'grams', rp.grams
                        -- 'proteins', p.proteins,
                        -- 'carbs', p.carbs,
                        -- 'fat', p.fat,
                        -- 'kcal', (p.proteins * 4) + (p.carbs * 4) + (p.fat * 9)
                    )
                ) AS products
            FROM recipe_products rp
            LEFT JOIN recipes r ON rp.recipe_id = r.id
            LEFT JOIN food_products p ON rp.product_id = p.id
            WHERE r.slug = $1
            GROUP BY r.id ORDER BY r.title ASC;`;

        try {
            const { rows } = await db.query(queryString, [slug]);
            return rows.length ? rows[0] : null;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = Recipe;