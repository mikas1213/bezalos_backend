select fm.id, fm.title, fm.logic, fm.is_lactose, fm.is_gluten, COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
	'id', fmp.id,
	'product_id', fmp.product_id,
	'meal_id', fm.id,
	'title', fp.title,
	'b_100', fp.proteins,
	'a_100', fp.carbs,
	'r_100', fp.fat,
	'grams', fmp.grams
) ORDER BY fmp.created_at ASC) FILTER (WHERE fmp.id IS NOT NULL), '[]'::json) 
AS products from food_meals AS fm
LEFT join food_meal_products AS fmp ON fm.id = fmp.meal_id 
LEFT join food_products AS fp ON fmp.product_id = fp.id where LOWER(fm.title) LIKE $1 AND fm.logic LIKE $2
group by fm.id, fm.title, fm.logic, fm.is_lactose, fm.is_gluten order by fm.created_at DESC

-- CHATGPT ANSWER EXPERIMENTING
SELECT json_agg(json_build_object(
	'plan_id', np.plan_id,
	'plan_name', np.plan_name,
	'meals', (SELECT json_agg(json_build_object(
		
		'meal_id', m.meal_id,
		'meal_name', m.meal_name,
		'products', (SELECT json_agg(json_build_object(
			
			'product_id', p.product_id,
			'product_name', p.product_name,
			'sub_products', (SELECT json_agg(json_build_object(
				
				'sub_product_id', sp.sub_product_id,
				'sub_product_name', sp.sub_product_name))
					FROM products sp
                    WHERE sp.parent_product_id = p.product_id
                )))
                    FROM products p
                    JOIN meal_products mp ON p.product_id = mp.product_id
                    WHERE mp.meal_id = m.meal_id
                )
            )
        )
            FROM meals m
            JOIN nutrition_plan_meals npm ON m.meal_id = npm.meal_id
            WHERE npm.plan_id = np.plan_id
        )
    )
)
FROM nutrition_plans np;


