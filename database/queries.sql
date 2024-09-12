-- myselect
SELECT nutrition_plans.id, nutrition_plans.title,
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
GROUP BY nutrition_plans.id;

-- myselect
SELECT videos.title, count(c), JSON_AGG(JSON_BUILD_OBJECT(
	'user_name', (select users.name from users where users.id = c.user_id),
	'komentaras', c.comment
)) AS komentarai FROM videos
LEFT JOIN comments AS c ON videos.id = c.video_id
GROUP by videos.id