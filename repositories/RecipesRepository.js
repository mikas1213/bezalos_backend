const { DatabaseError } = require('../utils/errors');
const BaseRepository = require('./BaseRepository');

class RecipesRepository extends BaseRepository {
    constructor(db) {
        const mapping = {d: 'duration'}
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
}

module.exports = RecipesRepository;