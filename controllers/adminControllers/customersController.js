const db = require('../../database/db');

exports.getAllUsers = async (req, res) => {

    try {
        const page = parseInt(req.query.page);
        const pageSize = parseInt(req.query.pageSize);
        const { search } = req.query;
        
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        
        const { column, sort, week, month, maintenance } = req.body;
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
        subscriptions.current_period_end as s_subscription_expires`;
        
        let where = `where role = $1 AND (LOWER(email) LIKE $2 OR LOWER(name) LIKE $2 OR LOWER(stripe_username) LIKE $2 OR TO_CHAR(last_activity, 'YYYY-MM-DD') LIKE $2)`;
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
            where = `where role = $1 AND plan_assign < $2 AND plan_assign_status NOT LIKE $3`;

        } else if(week) {
            from.setDate(from.getDate() - 28);
            to.setDate(to.getDate() - 14);
            queryParams = [2324, from.toLocaleString('lt-LT'), to.toLocaleString('lt-LT')];
            where = `where role = $1 AND plan_assign BETWEEN $2 AND $3`;

        } else if(month) {
            from.setDate(from.getDate() - 28);
            queryParams = [2324, from.toLocaleString('lt-LT'), 'month'];
            where = `where role = $1 AND plan_assign < $2 AND plan_assign_status NOT LIKE $3`;

        } else if(maintenance) {
            where = `where role = $1 AND maintenance IS NOT null AND maintenance_status NOT LIKE '4 sav' AND (LOWER(email) LIKE $2 OR LOWER(name) LIKE $2 OR LOWER(stripe_username) LIKE $2 OR TO_CHAR(last_activity, 'YYYY-MM-DD') LIKE $2)`;
        }
        
        let queryString = `SELECT ${columns} from users LEFT JOIN subscriptions ON users.id = subscriptions.user_id ${where} ORDER BY ${column} ${sort} NULLS LAST;`;

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
}

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
}





