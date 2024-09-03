-- myselect
SELECT nutrition_plans.id, nutrition_plans.title,
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
GROUP BY nutrition_plans.id;

-- myselect
SELECT videos.title, count(c), JSON_AGG(JSON_BUILD_OBJECT(
	'user_name', (select users.name from users where users.id = c.user_id),
	'komentaras', c.comment
)) AS komentarai FROM videos
LEFT JOIN comments AS c ON videos.id = c.video_id
GROUP by videos.id