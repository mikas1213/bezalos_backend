const db = require('../database/db');

class Meal {
    static getAllMealsQuery(is_gluten, is_lactose) {
        is_gluten = is_gluten === 'true' ? true : false;
        is_lactose = is_lactose === 'true' ? true : false;

        let where = 'where LOWER(fm.title) LIKE $1 AND fm.logic LIKE $2';
        if(is_gluten && is_lactose) {
            where += ` AND (fm.intolerance = 'gluten_free' OR fm.intolerance = 'lactose_free')`;
        } else if(is_gluten) {
            where += ` AND fm.intolerance = 'gluten_free'`;
        } else if(is_lactose) {
            where += ` AND fm.intolerance = 'lactose_free'`;
        }

        const queryString = `select fm.id, fm.title, fm.logic, fm.intolerance, COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
            'id', fmp.id,
            'product_id', fmp.product_id,
            'meal_id', fm.id,
            'title', fp.title,
            'category', fp.category,
            'sub_category', fp.sub_category,
            'b_100', fp.proteins,
            'a_100', fp.carbs,
            'r_100', fp.fat,
            'grams', fmp.grams
        ) ORDER BY fmp.created_at ASC) FILTER (WHERE fmp.id IS NOT NULL), '[]'::json) AS products from food_meals AS fm
        LEFT join food_meal_products AS fmp ON fm.id = fmp.meal_id 
        LEFT join food_products AS fp ON fmp.product_id = fp.id ${where} AND fm.is_template = true
        group by fm.id, fm.title, fm.logic, fm.intolerance order by fm.created_at DESC`;

        return queryString;
    }
};

module.exports = Meal;