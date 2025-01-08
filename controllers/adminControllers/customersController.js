const db = require('../../database/db');
const User = require('../../Models/User');

exports.searchUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const queryString = `SELECT id, name, email, stripe_username FROM users WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $1 OR LOWER(stripe_username) LIKE $1`;
        const { rows } = await db.query(queryString, [`%${search.toLowerCase()}%`]);       
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        })
    }
};

exports.getAllUsers = async (req, res) => {

    try {
        /* PAGINATION */
        const page = parseInt(req.query.page);
        const pageSize = parseInt(req.query.pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        /* - - - - - - */

        const { search } = req.query;
        const { column, sort = 'ASC', week, month, maintenance, service } = req.body;
        const validColumns = ['s_subscription_expires', 'name', 'email', 'subscription_expires', 'last_activity', 'plan_prepare', 'plan_assign', 'subscription_type', 'eat_status', 'eat_calories', 'created_at'];
        
        const columns = `
            users.id, 
            role, 
            name, 
            email, 
            stripe_username, 
            initial_target, 
            subscription, 
            subscription_type, 
            TO_CHAR(subscription_expires, 'YYYY-MM-DD') AS subscription_expires, 
            TO_CHAR(plan_prepare, 'YYYY-MM-DD') AS plan_prepare, 
            plan_prepare_status, 
            TO_CHAR(plan_assign, 'YYYY-MM-DD') AS plan_assign, 
            plan_assign_status, 
            TO_CHAR(maintenance, 'YYYY-MM-DD') AS maintenance, 
            maintenance_status, 
            last_activity, 
            users.created_at,
            eats_status, 
            eats_calories, 
            subscriptions.status as s_status, 
            subscriptions.current_period_end as s_subscription_expires,

            COALESCE((
                SELECT JSON_AGG(JSON_BUILD_OBJECT(
                    'id', o.id,
                    'user_id', o.user_id,
                    'title', o.title,
                    'price', o.price,
                    'created_at', o.created_at
                ) ORDER BY o.created_at DESC)
                FROM orders AS o WHERE o.user_id = users.id
            ), '[]'::json) AS orders,

            CASE WHEN EXISTS (
                SELECT 1 FROM orders o WHERE o.user_id = users.id
            ) THEN true ELSE false END as has_order
        `;

        let where = `WHERE role = $1 AND (LOWER(email) LIKE $2 OR LOWER(name) LIKE $2 OR LOWER(stripe_username) LIKE $2 OR TO_CHAR(last_activity, 'YYYY-MM-DD') LIKE $2)`;
        let queryParams = [2324, `%${search.toLowerCase()}%`];

        var from = new Date();
        var to = new Date();

        if(!validColumns.includes(column)) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid column ${column}`
            });
        }

        if(week && month) {
            from.setDate(from.getDate() - 14);
            queryParams = [2324, from.toLocaleString('lt-LT'), 'month'];
            where = `WHERE role = $1 AND plan_assign < $2 AND plan_assign_status NOT LIKE $3`;

        } else if(week) {
            from.setDate(from.getDate() - 28);
            to.setDate(to.getDate() - 14);
            queryParams = [2324, from.toLocaleString('lt-LT'), to.toLocaleString('lt-LT')];
            where = `WHERE role = $1 AND plan_assign BETWEEN $2 AND $3`;

        } else if(month) {
            from.setDate(from.getDate() - 28);
            queryParams = [2324, from.toLocaleString('lt-LT'), 'month'];
            where = `WHERE role = $1 AND plan_assign < $2 AND plan_assign_status NOT LIKE $3`;

        } else if(maintenance) {
            where = `WHERE role = $1 AND maintenance IS NOT null AND maintenance_status NOT LIKE '4 sav' AND (LOWER(email) LIKE $2 OR LOWER(name) LIKE $2 OR LOWER(stripe_username) LIKE $2 OR TO_CHAR(last_activity, 'YYYY-MM-DD') LIKE $2)`;
        } 

        let queryString = `SELECT ${columns} FROM users LEFT JOIN subscriptions ON users.id = subscriptions.user_id ${where} ORDER BY ${column} ${sort} NULLS LAST;`;
        if(service) {
            where = `WHERE role = $1 AND (LOWER(email) LIKE $2 OR LOWER(name) LIKE $2 OR LOWER(stripe_username) LIKE $2 OR TO_CHAR(last_activity, 'YYYY-MM-DD') LIKE $2) AND plan_assign IS NULL`;
            queryString = `SELECT ${columns} FROM users INNER JOIN orders o ON users.id = o.user_id LEFT JOIN subscriptions ON users.id = subscriptions.user_id ${where} ORDER BY ${column} ${sort} NULLS LAST;`;
        }

        const { rows } = await db.query(queryString, queryParams);       
        const paginatedUsers = rows.slice(startIndex, endIndex);
        const totalPage = Math.ceil(rows.length / pageSize);
         
        res.status(200).json({
            data: paginatedUsers,
            totalPage
        });
    } catch (err) {
        console.log(err.message);
    }
};

exports.getOneUser = async (req, res) => {
    
    try {
        const { id } = req.params;
        const { rows } = await db.query(User.getUserDetailsQuery(), [id]);     
        if(rows.length === 0) return res.status(404).json({
            message: 'Toks vartotojas nerastas'
        });
        res.status(200).json(rows[0]);

    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.updateUser = async (req, res) => {
    const { value, column } = req.body;
    
    const id = req.params.id;
    const validColumns = [
        'subscription_expires', 
        'plan_prepare', 
        'plan_assign', 
        'maintenance', 
        'plan_prepare_status', 
        'plan_assign_status',
        'maintenance_status',
        'eats_status',
        'eats_calories'
    ];
    
    let queryString = '';
    let queryParams = [];

    try {
        if(!validColumns.includes(column)) {
            return res.status(400).json({
                status: 'error',
                message: `Column \'${column}\' don't exist!`
            })
        }

        queryString = `UPDATE users SET ${column} = $2, updated_at = $3 WHERE id = $1;`;
        queryParams = [req.params.id, value, new Date().toLocaleString('lt-LT')];
            
        if(column === 'eats_calories' && isNaN(value)) throw new Error('Turi būti tik skaičiai')
        
        if(column === 'subscription_expires') {
            const { stripe_type } = req.body
            if(stripe_type) {
                queryString = `UPDATE users SET ${column} = $2, updated_at = $3 WHERE id = $1;`;
                queryParams = [req.params.id, value, new Date().toLocaleString('lt-LT')];
            } else {
                const plan = !!value ? 'Virtuvė' : 'free';
                queryString = `UPDATE users SET ${column} = $2, subscription = $3, subscription_type = $4, updated_at = $5 WHERE id = $1;`;
                queryParams = [req.params.id, value, !!value, plan, new Date().toLocaleString('lt-LT')];
            }
        } 
            
        await db.query(queryString, queryParams);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.updateUserPlan = async (req, res) => {
    
    const { id: plan_id } = req.params;
    const { action, actionData } = req.body;
    const today = new Date().toLocaleString('lt-LT');

    try {
        switch(action) {
            case 'update-plan-title':
                await updatePlanTitle(actionData.title, today, actionData.user_id, plan_id);
                break;
            case 'update-meal-time':
                await updateMealTime(actionData.meal_time, plan_id, actionData.meal_id);
                break;
            case 'update-meal-title': 
                await updateMeal(actionData.meal, today, plan_id, actionData.meal_id);
                break;
            case 'update-product-title':
                await updateProduct(actionData.prod, today, plan_id, actionData.meal_id, actionData.prod_id);
                break;
            case 'update-prod-grams':
                updateProdGrams(actionData.grams, today, plan_id, actionData.prod_id);
                break;
            case 'delete-product':
                deleteProducts(plan_id, actionData.meal_id, actionData.prod_id);
                break;
            case 'delete-plan':
                deletePlan(actionData.user_id, plan_id);
                break;
            default:
                return res.status(400).json({message: 'Invalid action'})
        }
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};


async function updatePlanTitle(title, today, user_id, plan_id) {
    const query_str = 'UPDATE user_plans SET title = $1, updated_at = $2 WHERE user_id = $3 AND id = $4';
    await db.query(query_str, [title, today, user_id, plan_id]);
}

async function updateMealTime(meal_time, plan_id, meal_id) {
    const query_str = 'UPDATE user_meals SET meal_time = $1 WHERE plan_id = $2 AND id = $3';
    await db.query(query_str, [meal_time, plan_id, meal_id]);
}

async function updateMeal(meal, today, plan_id, meal_id) {

    try {
        let prod_date = new Date();
        const query_str = 'UPDATE user_meals SET title = $1, logic = $2, intolerance = $3, updated_at = $4 WHERE plan_id = $5 AND id = $6'; 
        await db.query('BEGIN');
        await db.query(query_str, [meal.label, meal.logic, meal.intolerance, today, plan_id, meal_id]);
        await db.query('DELETE FROM user_products WHERE plan_id = $1 AND meal_id = $2', [plan_id, meal_id]);

        const prod_query = 'INSERT INTO user_products (meal_id, plan_id, title, category, sub_category, b_100, a_100, r_100, grams, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
        for(const prod of meal.products) {
            prod_date.setSeconds(prod_date.getSeconds() + 1);
            await db.query(prod_query, [meal_id, plan_id, prod.title, prod.category, prod.sub_category, prod.b_100, prod.a_100, prod.r_100, prod.grams, prod_date.toLocaleString('lt-LT')]);
        }

        await db.query('COMMIT');
    } catch (err) {
        await db.query('ROLLBACK');
        throw new Error(err.message)
    }
}

async function updateProduct(prod, today, plan_id, meal_id, prod_id) {
    const query_str = 'UPDATE user_products SET title = $1, category = $2, sub_category = $3, b_100 = $4, a_100 = $5, r_100 = $6, updated_at = $7 WHERE plan_id = $8 AND meal_id = $9 AND id = $10';
    await db.query(query_str, [prod.label, prod.category, prod.sub_category, prod.b_100, prod.a_100, prod.r_100, today, plan_id, meal_id, prod_id]);
}

async function updateProdGrams(grams, today, plan_id, prod_id) {
    const query_str = 'UPDATE user_products SET grams = $1, updated_at = $2 WHERE plan_id = $3 AND id = $4';
    await db.query(query_str, [grams, today, plan_id, prod_id]);
}

async function deleteProducts(plan_id, meal_id, prod_id) {
    const query_str = 'DELETE from user_products WHERE plan_id = $1 AND meal_id = $2 AND id = $3';
    await db.query(query_str, [plan_id, meal_id, prod_id]);
}

async function deletePlan(user_id, plan_id) {
    await db.query('DELETE from user_plans WHERE user_id = $1 AND id = $2', [user_id, plan_id]);
}



