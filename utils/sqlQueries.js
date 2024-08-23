exports.resetPasswordUpdate = 'UPDATE users SET password = $1, password_reset_token = $2, password_reset_expires = $3 WHERE email = $4';

exports.obj = {pirmas: 'SELECT FROM VIENAS', antras: 'SELECT FROM ANTRAS'};

exports.trys_lentos = `SELECT nutrition_plans.id, nutrition_plans.title,
JSON_AGG(JSON_BUILD_OBJECT(
    'id', meals.id,
    'title', meals.title,
    'logic', meals.logic,
    'time', meals.time,
    'products', (SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
        'id', products.id, 
        'title', products.title,
        'category', products.category,
        'grams', products.grams,
        'carbs', products.carbs,
        'proteins', products.proteins,
        'fat', products.fat
    )), '[]'::json) FROM products WHERE products.meal_id = meals.id))
) AS meals_plans FROM nutrition_plans 
LEFT JOIN meals ON nutrition_plans.id = meals.nutrition_plan_id 
WHERE nutrition_plans.id = $1
GROUP BY nutrition_plans.id`