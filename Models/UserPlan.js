const db = require('../database/db');

class UserPlan {
    static getUserPlans() {

        const queryString = `SELECT up.id, up.title, up.b, up.a, up.r, up.kcal, COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
            'title', um.title,
            'logic', um.logic,
            'intolerance', um.intolerance,
            'is_sport', um.is_sport,
            'meal_time', um.meal_time,
            'b', um.b,
            'a', um.a,
            'r', um.r,
            'kcal', um.kcal,
            'products', COALESCE((SELECT JSON_AGG(JSON_BUILD_OBJECT(
                'title', up.title,
                'b_100', up.b_100,
                'a_100', up.a_100,
                'r_100', up.r_100,
                'grams', up.grams
            ) ORDER BY up.created_at ASC) FROM user_products up WHERE up.meal_id = um.id), '[]'::json))
        ORDER BY um.created_at ASC), '[]'::json) AS meals 
        FROM user_plans up 
        LEFT JOIN user_meals um ON up.id = um.plan_id 
        WHERE user_id = $1
        GROUP BY up.id, up.title, up.b, up.a, up.r, up.kcal;`;

        return queryString;
    }
};

module.exports = UserPlan;