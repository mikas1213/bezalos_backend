exports.resetPasswordUpdate = 'UPDATE users SET password = $1, password_reset_token = $2, password_reset_expires = $3 WHERE email = $4';

exports.obj = {pirmas: 'SELECT FROM VIENAS', antras: 'SELECT FROM ANTRAS'};

exports.trys_lentos = `SELECT nutrition_plans.id, nutrition_plans.title,
    JSON_AGG(JSON_BUILD_OBJECT(
		'id', meals.id,
		'title', meals.title,
		'logic', meals.logic,
		'time', meals.time,
		'products', (SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
			'id', products_dev.id, 
			'title', products_dev.title,
			'category', products_dev.category,
			'grams', products_dev.grams,
			'carbs', products_dev.carbs,
			'proteins', products_dev.proteins,
			'fat', products_dev.fat
		)), '[]'::json) FROM products_dev WHERE products_dev.meal_id = meals.id))
    ) AS meals_plans FROM nutrition_plans
LEFT JOIN meals ON nutrition_plans.id = meals.nutrition_plan_id
WHERE nutrition_plans.id = $1
GROUP BY nutrition_plans.id;`