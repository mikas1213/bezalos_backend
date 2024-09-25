select fm.id, fm.title, fm.logic, fm.is_lactose, fm.is_gluten, COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
	'id', fmp.id,
	'product_id', fmp.product_id,
	'meal_id', fm.id,
	'title', fp.title,
	'b_100', fp.proteins,
	'a_100', fp.carbs,
	'r_100', fp.fat,
	'grams', fmp.grams
) ORDER BY fmp.created_at ASC) FILTER (WHERE fmp.id IS NOT NULL), '[]'::json) AS products from food_meals AS fm
LEFT join food_meal_products AS fmp ON fm.id = fmp.meal_id 
LEFT join food_products AS fp ON fmp.product_id = fp.id where LOWER(fm.title) LIKE $1 AND fm.logic LIKE $2
group by fm.id, fm.title, fm.logic, fm.is_lactose, fm.is_gluten order by fm.created_at DESC




