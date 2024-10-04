const db = require('../database/db');

class Plan {
    static getAllPlansQuery(meal_count, is_vegetarian) {

        let where = `WHERE LOWER(fpl.title) LIKE $1`;
        if(is_vegetarian) where = `WHERE LOWER(fpl.title) LIKE $1 AND fpl.is_vegetarian = $3`;

        let having = `HAVING COUNT(CASE WHEN fpm.meal_id IS NOT NULL THEN 1 END) >= $2`;
        if(meal_count > 0) having = `HAVING COUNT(CASE WHEN fpm.meal_id IS NOT NULL THEN 1 END) = $2`;

        const queryString = `SELECT fpl.id, fpl.plan_type, fpl.title, fpl.is_vegetarian, CAST(COUNT(fpm.meal_id) AS INTEGER) AS meal_count,
	        COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                'id', fpm.id,
                'meal_id', fm.id,
                'title', fm.title,
                'logic', fm.logic,
                'intolerance', fm.intolerance, 
                'is_sport', fpm.is_sport,
                'meal_time_from', fpm.meal_time_from,
                'meal_time_to', fpm.meal_time_to,
                'b', (SELECT SUM(fp.proteins * fmp.grams / 100)
                    FROM food_meal_products AS fmp
                    LEFT JOIN food_products AS fp ON fmp.product_id = fp.id
                    WHERE fmp.meal_id = fm.id),

                'a', (SELECT SUM(fp.carbs * fmp.grams / 100)
                    FROM food_meal_products AS fmp
                    LEFT JOIN food_products AS fp ON fmp.product_id = fp.id
                    WHERE fmp.meal_id = fm.id),

                'r', (SELECT SUM(fp.fat * fmp.grams / 100)
                    FROM food_meal_products AS fmp
                    LEFT JOIN food_products AS fp ON fmp.product_id = fp.id
                    WHERE fmp.meal_id = fm.id),

                -- 'kcal', (SELECT (SUM(fp.proteins * fmp.grams / 100) * 4) + (SUM(fp.carbs * fmp.grams / 100) * 4) + (SUM(fp.fat * fmp.grams / 100) * 9)
                    -- FROM food_meal_products AS fmp
                    -- LEFT JOIN food_products AS fp ON fmp.product_id = fp.id
                   -- WHERE fmp.meal_id = fm.id),

                'products', (select COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                    'id', fp.id,
                    'title', fp.title,
                    'b_100', fp.proteins,
                    'a_100', fp.carbs,
                    'r_100', fp.fat,
                    'grams', fmp.grams
                ) ORDER BY fmp.created_at ASC) FILTER (WHERE fmp.id IS NOT NULL), '[]'::json) 
                AS products from food_meals AS f_meal
                LEFT join food_meal_products AS fmp ON f_meal.id = fmp.meal_id 
                LEFT join food_products AS fp ON fmp.product_id = fp.id
                WHERE f_meal.id = fm.id)

	        ) ORDER BY fpm.created_at ASC) FILTER (WHERE fpm.id IS NOT NULL), '[]'::json) AS meals FROM food_plans AS fpl
        LEFT JOIN food_plan_meals AS fpm ON fpl.id = fpm.plan_id 
        LEFT JOIN food_meals AS fm ON fpm.meal_id = fm.id 
        ${where}
        GROUP BY fpl.id, fpl.plan_type, fpl.title, fpl.is_vegetarian
        ${having}
        ORDER BY fpl.created_at DESC`;
        return queryString;
    }
};

module.exports = Plan;