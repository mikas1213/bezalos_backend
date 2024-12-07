const db = require('../database/db');

class User {
    static getUserDetailsQuery() {
        const queryString = `SELECT 
            u.id,
            u.name,
            u.email,
            u.stripe_username, 
            u.plan_assign, 
            u.subscription_type,
            u.initial_target,
            COALESCE((SELECT JSON_AGG(JSON_BUILD_OBJECT( 
                'id', ur.id,
                'title', ur.title,
                'b', (
                    SELECT SUM(urp.proteins * urp.grams / 100)
                    FROM user_recipe_products urp 
                    WHERE urp.recipe_id = ur.id
                ),
                'a', (
                    SELECT SUM(urp.carbs * urp.grams / 100)
                    FROM user_recipe_products urp 
                    WHERE urp.recipe_id = ur.id
                ),
                'r', (
                    SELECT SUM(urp.fat * urp.grams / 100)
                    FROM user_recipe_products urp 
                    WHERE urp.recipe_id = ur.id
                ),
                'products', (SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                    'id', urp.id,
                    'product_id', urp.product_id,
                    'title', urp.title,
                    'proteins', urp.proteins,
                    'carbs', urp.carbs,
                    'fat', urp.fat,
                    'grams', urp.grams
                ) ORDER BY urp.created_at ASC), '[]'::json) FROM user_recipe_products urp WHERE urp.recipe_id = ur.id)) 
            ORDER BY ur.created_at ASC) FROM user_recipes ur WHERE ur.user_id = $1), '[]'::json) AS recipes,
            (SELECT COALESCE(JSON_AGG(a.*), '[]'::json) FROM anketa a WHERE a.user_id = $1) as anketa,
            -- (SELECT JSONB_OBJECT_AGG(a.id, a.user_id) FROM anketa a WHERE a.user_id = $1) as anketa,
            COALESCE((SELECT JSON_AGG(JSON_BUILD_OBJECT(
                'id', up.id,
                'title', up.title,
                'b', (SELECT SUM(u_prod.b_100 * u_prod.grams / 100) FROM user_products AS u_prod 
                    INNER JOIN user_meals AS um ON um.id = u_prod.meal_id 
                    WHERE um.plan_id = up.id)::INTEGER,
                'a', (SELECT SUM(u_prod.a_100 * u_prod.grams / 100) FROM user_products AS u_prod 
                    INNER JOIN user_meals AS um ON um.id = u_prod.meal_id 
                    WHERE um.plan_id = up.id)::INTEGER,
                'r', (SELECT SUM(u_prod.r_100 * u_prod.grams / 100) FROM user_products AS u_prod 
                    INNER JOIN user_meals AS um ON um.id = u_prod.meal_id 
                    WHERE um.plan_id = up.id)::INTEGER,
                'kcal', (SELECT SUM((u_prod.b_100 * u_prod.grams / 100 * 4) + (u_prod.a_100 * u_prod.grams / 100 * 4) + (u_prod.r_100 * u_prod.grams / 100 * 9)) FROM user_products AS u_prod 
                    INNER JOIN user_meals AS um ON um.id = u_prod.meal_id 
                    WHERE um.plan_id = up.id)::INTEGER,

                'meals', (SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                    'id', um.id,
                    'meal_id', um.id,
                    'title', um.title,
                    'logic', um.logic,
                    'intolerance', um.intolerance,
                    'is_sport', um.is_sport,
                    'meal_time', um.meal_time,
                    'b', (SELECT SUM(u_prod.b_100 * u_prod.grams / 100)::INTEGER FROM user_products AS u_prod WHERE u_prod.meal_id = um.id),
                    'a', (SELECT SUM(u_prod.a_100 * u_prod.grams / 100)::INTEGER FROM user_products AS u_prod WHERE u_prod.meal_id = um.id),
                    'r', (SELECT SUM(u_prod.r_100 * u_prod.grams / 100)::INTEGER FROM user_products AS u_prod WHERE u_prod.meal_id = um.id),
                    'kcal', (SELECT SUM((u_prod.b_100 * u_prod.grams / 100 * 4) + (u_prod.a_100 * u_prod.grams / 100 * 4) + (u_prod.r_100 * u_prod.grams / 100 * 9)) FROM user_products AS u_prod WHERE u_prod.meal_id = um.id)::INTEGER,
                    'products', (SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                        'id', up_prod.id,
                        'product_id', up_prod.id,
                        'title', up_prod.title,
                        'category', up_prod.category,
                        'sub_category', up_prod.sub_category,
                        'b_100', up_prod.b_100,
                        'a_100', up_prod.a_100,
                        'r_100', up_prod.r_100,
                        'grams', up_prod.grams
                    ) ORDER by up_prod.created_at ASC), '[]'::json) FROM user_products up_prod WHERE up_prod.meal_id = um.id
                )) ORDER BY um.created_at ASC), '[]'::json) FROM user_meals um WHERE um.plan_id = up.id)
            ) ORDER BY up.created_at ASC) FROM user_plans up WHERE up.user_id = u.id
        ), '[]'::json) AS plans FROM users u WHERE u.id = $1 GROUP BY u.id;`;

        return queryString;
    }

    static userAnketaUpsertQuery() {
        const queryString = `
        INSERT INTO anketa(
            user_id, 
            gender, 
            age, 
            height, 
            weight, 
            activity_steps,
            goal,
            schedule,
            feeding,
            feeding_desc,
            health_problems,
            health_problems_desc,
            diet,
            diet_desc,
            intolerance,
            intolerance_desc,
            breakfast, 
            breakfast_time, 
            breakfast_desc, 
            lunch, 
            lunch_time, 
            lunch_desc, 
            snack, 
            snack_time, 
            snack_desc, 
            dinner, 
            dinner_time, 
            dinner_desc, 
            routines, 
            additional_info)
            VALUES(
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
            ) ON CONFLICT (user_id) DO UPDATE SET
                gender = EXCLUDED.gender, 
                age = EXCLUDED.age, 
                height = EXCLUDED.height, 
                weight = EXCLUDED.weight, 
                activity_steps = EXCLUDED.activity_steps,
                goal = EXCLUDED.goal,
                schedule = EXCLUDED.schedule,
                feeding = EXCLUDED.feeding,
                feeding_desc = EXCLUDED.feeding_desc,
                health_problems = EXCLUDED.health_problems,
                health_problems_desc = EXCLUDED.health_problems_desc,
                diet = EXCLUDED.diet,
                diet_desc = EXCLUDED.diet_desc,
                intolerance = EXCLUDED.intolerance,
                intolerance_desc = EXCLUDED.intolerance_desc,
                breakfast = EXCLUDED.breakfast, 
                breakfast_time = EXCLUDED.breakfast_time, 
                breakfast_desc = EXCLUDED.breakfast_desc, 
                lunch = EXCLUDED.lunch, 
                lunch_time = EXCLUDED.lunch_time, 
                lunch_desc = EXCLUDED.lunch_desc, 
                snack = EXCLUDED.snack, 
                snack_time = EXCLUDED.snack_time, 
                snack_desc = EXCLUDED.snack_desc, 
                dinner = EXCLUDED.dinner, 
                dinner_time = EXCLUDED.dinner_time, 
                dinner_desc = EXCLUDED.dinner_desc, 
                routines = EXCLUDED.routines, 
                additional_info = EXCLUDED.additional_info,
                updated_at = CURRENT_TIMESTAMP
        `;
        return queryString;
    }
};

module.exports = User;