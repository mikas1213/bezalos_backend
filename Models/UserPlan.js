const db = require('../database/db');

class UserPlan {
    static getUserPlans() {

        const queryString = `SELECT 
            up.id, 
            up.title, 
            (SELECT SUM(u_prod.b_100 * u_prod.grams / 100) FROM user_products AS u_prod 
                INNER JOIN user_meals AS um ON um.id = u_prod.meal_id 
                WHERE um.plan_id = up.id)::INTEGER AS b,

            (SELECT SUM(u_prod.a_100 * u_prod.grams / 100) FROM user_products AS u_prod 
                INNER JOIN user_meals AS um ON um.id = u_prod.meal_id 
                WHERE um.plan_id = up.id)::INTEGER AS a,

            (SELECT SUM(u_prod.r_100 * u_prod.grams / 100) FROM user_products AS u_prod 
                INNER JOIN user_meals AS um ON um.id = u_prod.meal_id 
                WHERE um.plan_id = up.id)::INTEGER AS r,

            (SELECT SUM((u_prod.b_100 * u_prod.grams / 100 * 4) + (u_prod.a_100 * u_prod.grams / 100 * 4) + (u_prod.r_100 * u_prod.grams / 100 * 9)) FROM user_products AS u_prod 
                INNER JOIN user_meals AS um ON um.id = u_prod.meal_id 
                WHERE um.plan_id = up.id)::INTEGER AS kcal,

            COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                'id', um.id,
                'title', um.title,
                'logic', um.logic,
                'intolerance', um.intolerance,
                'is_sport', um.is_sport,
                'meal_time', um.meal_time,
                'b', (SELECT SUM(u_prod.b_100 * u_prod.grams / 100)::INTEGER FROM user_products AS u_prod WHERE u_prod.meal_id = um.id),
                'a', (SELECT SUM(u_prod.a_100 * u_prod.grams / 100)::INTEGER FROM user_products AS u_prod WHERE u_prod.meal_id = um.id),
                'r', (SELECT SUM(u_prod.r_100 * u_prod.grams / 100)::INTEGER FROM user_products AS u_prod WHERE u_prod.meal_id = um.id),
                'kcal', (SELECT SUM((u_prod.b_100 * u_prod.grams / 100 * 4) + (u_prod.a_100 * u_prod.grams / 100 * 4) + (u_prod.r_100 * u_prod.grams / 100 * 9)) FROM user_products AS u_prod WHERE u_prod.meal_id = um.id)::INTEGER,
                'products', COALESCE((SELECT JSON_AGG(JSON_BUILD_OBJECT(
                    'id', up.id,
                    'title', up.title,
                    'category', up.category,
                    'sub_category', up.sub_category,
                    'b_100', up.b_100,
                    'a_100', up.a_100,
                    'r_100', up.r_100,
                    'grams', up.grams
                ) ORDER BY up.created_at ASC) FROM user_products AS up WHERE up.meal_id = um.id), '[]'::json))
            ORDER BY um.created_at ASC), '[]'::json) AS meals 
            FROM user_plans up 
            LEFT JOIN user_meals AS um ON up.id = um.plan_id 
            WHERE user_id = $1
            GROUP BY up.id, up.title;`;

        const queryString_old = `SELECT up.id, up.title, up.b, up.a, up.r, up.kcal, COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
            'id', um.id,
            'title', um.title,
            'logic', um.logic,
            'intolerance', um.intolerance,
            'is_sport', um.is_sport,
            'meal_time', um.meal_time,
            'b', um.b,
            'a', um.a,
            'r', um.r,
            'kcal', um.kcal,
            'test', 'test',
            'products', COALESCE((SELECT JSON_AGG(JSON_BUILD_OBJECT(
                'id', up.id,
                'title', up.title,
                'b_100', up.b_100,
                'a_100', up.a_100,
                'r_100', up.r_100,
                'grams', up.grams
            ) ORDER BY up.created_at ASC) FROM user_products AS up WHERE up.meal_id = um.id), '[]'::json))
        ORDER BY um.created_at ASC), '[]'::json) AS meals 
        FROM user_plans up 
        LEFT JOIN user_meals um ON up.id = um.plan_id 
        WHERE user_id = $1
        GROUP BY up.id, up.title;`;

        return queryString;
    }
};

module.exports = UserPlan;