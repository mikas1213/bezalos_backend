const { DatabaseError } = require('../utils/errors');
const BaseRepository = require('./BaseRepository');

class RecipesRepository extends BaseRepository {
    constructor(db) {
        const mapping = {
            'dietary': 'is_vegetarian',
            'type': 'recipe_type',
            'meal': 'food_logic',
            'time': 'duration',
            'flavor': 'taste',
            'search': 'title'
        };
        super(db, 'recipes', mapping);
    }

    async findAllFavorites() {
        const query_string = `
            SELECT r.id, r.title, r.slug, r.duration, r.food_logic, r.image_s, COUNT(l.id) AS like_count
            FROM recipes AS r
            LEFT JOIN likes l ON r.id = l.entity_id
            LEFT JOIN like_categories AS lc ON l.category_id = lc.id
            WHERE lc.category_name = 'recipe'
            GROUP BY r.id, r.title, r.slug, r.duration, r.food_logic, r.image_s
            ORDER BY like_count DESC
            LIMIT 10;
        `;
    
        try {
            return await this.db.query(query_string);
        } catch (err) {
            throw new DatabaseError(err.message, err);
        }
    }

    async findRecipeWithProductsBySlug(slug) {
        const query_string = `
            SELECT 
                r.title, 
                r.slug, 
                r.image_l,
                r.video_link,
                r.is_vegetarian,
                r.food_logic,
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
                        'grams', rp.grams,
                        'created_at', rp.created_at
                    ) ORDER BY rp.created_at ASC
                ) AS products
            FROM recipe_products rp
            LEFT JOIN recipes r ON rp.recipe_id = r.id
            LEFT JOIN food_products p ON rp.product_id = p.id
            WHERE r.slug = $1
            GROUP BY r.id;
        `;

        try {
            const data = await this.db.query(query_string, [slug]);
            return data.length > 0 ? data[0] : null;
        } catch (err) {
            throw new DatabaseError(err.message, err);
        }
    }

    buildWhereClause(filters) {
        const where = [];
        const values = [];
        let param_count = 1;
        const searchable_columns = ['r.title', 'r.description', 'p.title']; 

        for (const [key, value] of Object.entries(this.mapFilter(filters))) {
            if (key === 'title') {
                if (typeof value !== 'string' || value.length > 255) {
                    continue; 
                }
                const search_conditions = searchable_columns.map(col => `${col} ILIKE $${param_count}`);
                where.push(`(${search_conditions.join(' OR ')})`);
                values.push(`%${value}%`);

            } else if(key === 'is_vegetarian' && value === 'vegan') {
                where.push(`${key} = $${param_count}`);
                values.push(true); 

            } else if(key === 'duration') {
                const [from, to] = value.split('-');
                console.log(from, to);
                where.push(`duration BETWEEN $${param_count} AND $${param_count + 1}`);
                values.push(Number(from), Number(to));
                param_count++; 

            } else {
                where.push(`${key} = $${param_count}`);
                values.push(value);
            }
            param_count++;
        }
        return { where_clause: where.length ? 'WHERE ' + where.join(' AND ') : '', values }
    }

    async findRecipesCount(filters) {
        const { where_clause, values } = this.buildWhereClause(filters);
        const count_query = `
            SELECT COUNT(DISTINCT r.id)::float AS total 
            FROM recipes r
            LEFT JOIN recipe_products rp ON rp.recipe_id = r.id
            LEFT JOIN food_products p ON rp.product_id = p.id
            ${where_clause};
        `;
        try {
            const [data] = await this.db.query(count_query, values);
            return data;
        } catch (err) {
            throw new DatabaseError(err.message, err);
        }
    }

    async findRecipes(filters, limit, offset, user_id) {
        const { where_clause, values } = this.buildWhereClause(filters);
        
        const query_string = `
            SELECT 
                r.id,
                r.title, 
                r.slug, 
                r.image_s,
                r.image_m,
                r.is_vegetarian,
                r.food_logic,
                r.recipe_type,
                r.duration,
                r.taste,
                r.description,
                r.video_link,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', rp.id, 
                        'product_id', p.id,
                        'title', p.title,
                        'grams', rp.grams,
                        'proteins', p.proteins, 
                        'carbs', p.carbs,
                        'fat', p.fat,
                        'created_at', rp.created_at
                    ) ORDER BY rp.created_at ASC
                ) AS products,
                COALESCE(SUM((p.proteins / 100) * rp.grams), 0)::float AS b,
                COALESCE(SUM((p.carbs / 100) * rp.grams), 0)::float AS a,
                COALESCE(SUM((p.fat / 100) * rp.grams), 0)::float AS r,
                COALESCE(SUM(((p.proteins * 4) + (p.carbs * 4) + (p.fat * 9)) / 100 * rp.grams), 0)::float AS kcal,
                COALESCE(l.likes_count, 0)::int AS likes,
                CASE 
                    WHEN $${values.length + 1} IS NULL THEN false  -- Is user logged-out, liked = false
                    WHEN ul.user_id IS NOT NULL THEN true 
                    ELSE false 
                END AS liked
            FROM recipe_products rp
            LEFT JOIN recipes r ON rp.recipe_id = r.id
            LEFT JOIN food_products p ON rp.product_id = p.id
            LEFT JOIN (
                SELECT entity_id, COUNT(*) AS likes_count 
                FROM likes 
                GROUP BY entity_id
            ) l ON l.entity_id = r.id
            LEFT JOIN likes AS ul ON ul.entity_id = r.id AND ul.user_id = $${values.length + 1} -- Logged-in user likes.
            ${where_clause}
            GROUP BY r.id, l.likes_count, ul.user_id
            ORDER BY r.created_at DESC
            LIMIT $${values.length + 2} OFFSET $${values.length + 3};
        `;
        values.push(user_id);
        values.push(limit, offset);

        try {
            return await this.db.query(query_string, values);
        } catch (err) {
            throw new DatabaseError(err.message, err);
        }
    }

    async checkIsRecipeExist(slug) {
        try {
            return await this.findBySlug(slug);
        } catch (err) {
            throw new DatabaseError(err.message, err);
        }
    }

    async createRecipe(recipeDTO, products) {
        try {
            await this.db.query('BEGIN');
            const [{ id: recipe_id }] = await this.create(recipeDTO);
            let recipe_date = new Date();
            const insert_products_query = 'INSERT INTO recipe_products (recipe_id, product_id, grams, created_at) VALUES ($1, $2, $3, $4)';
            
            for(const prod of JSON.parse(products)) {
                recipe_date.setSeconds(recipe_date.getSeconds() + 1);
                await this.db.query(insert_products_query, [recipe_id, prod.product_id, prod.grams, recipe_date.toLocaleString('lt-LT')]);
            }

            await this.db.query('COMMIT');
            return recipe_id;
        } catch (err) {
            await this.db.query('ROLLBACK');
            throw new DatabaseError(err.message, err);
        }
    }

    async updateRecipe(recipe_id, recipeDTO, products) {
        try {
            await this.db.query('BEGIN');
            await this.updateById(recipe_id, recipeDTO);
            await this.db.query(`DELETE FROM recipe_products WHERE recipe_id = $1`, [recipe_id]);    

            let recipe_date = new Date();
            const insert_products_query = 'INSERT INTO recipe_products (recipe_id, product_id, grams, created_at) VALUES ($1, $2, $3, $4)';
            for(const prod of JSON.parse(products)) {
                recipe_date.setSeconds(recipe_date.getSeconds() + 1);
                await this.db.query(insert_products_query, [recipe_id, prod.product_id, prod.grams, recipe_date.toLocaleString('lt-LT')]);
            }
            await this.db.query('COMMIT');
        } catch (err) {
            await this.db.query('ROLLBACK');
            throw new DatabaseError(err.message, err);
        }
    }
}

module.exports = RecipesRepository;