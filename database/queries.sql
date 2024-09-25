-- myselect
-- SELECT nutrition_plans.id, nutrition_plans.title,
--     JSON_AGG(JSON_BUILD_OBJECT(
-- 		'id', meals.id,
-- 		'title', meals.title,
-- 		'logic', meals.logic,
-- 		'time', meals.time,
-- 		'products', (SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
-- 			'id', products_dev.id, 
-- 			'title', products_dev.title,
-- 			'category', products_dev.category,
-- 			'grams', products_dev.grams,
-- 			'carbs', products_dev.carbs,
-- 			'proteins', products_dev.proteins,
-- 			'fat', products_dev.fat
-- 		)), '[]'::json) FROM products_dev WHERE products_dev.meal_id = meals.id))
--     ) AS meals_plans FROM nutrition_plans
-- LEFT JOIN meals ON nutrition_plans.id = meals.nutrition_plan_id
-- GROUP BY nutrition_plans.id;

-- myselect
-- SELECT videos.title, count(c), JSON_AGG(JSON_BUILD_OBJECT(
-- 	'user_name', (select users.name from users where users.id = c.user_id),
-- 	'komentaras', c.comment
-- )) AS komentarai FROM videos
-- LEFT JOIN comments AS c ON videos.id = c.video_id
-- GROUP by videos.id


-- *****************************
-- * M E A L S   Q U E R I E S *
-- *****************************

--GET-ALL-MEALS-SELECT-START
-- select fm.id, fm.title, fm.logic, fm.intolerance, COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
-- 	'id', fmp.id,
-- 	'product_id', fmp.product_id,
-- 	'meal_id', fm.id,
-- 	'title', fp.title,
-- 	'b_100', fp.proteins,
-- 	'a_100', fp.carbs,
-- 	'r_100', fp.fat,
-- 	'grams', fmp.grams
-- ) ORDER BY fmp.created_at ASC) FILTER (WHERE fmp.id IS NOT NULL), '[]'::json) AS products from food_meals AS fm
-- LEFT join food_meal_products AS fmp ON fm.id = fmp.meal_id 
-- LEFT join food_products AS fp ON fmp.product_id = fp.id where LOWER(fm.title) LIKE $1 AND fm.logic LIKE $2
-- group by fm.id, fm.title, fm.logic, fm.intolerance order by fm.created_at DESC
--GET-ALL-MEALS-SELECT-END



--GET-ALL-MEALS-SELECT-INTOLERANCE-START


--GET-ALL-MEALS-SELECT-INTOLERANCE-END