const db = require('../database/db');
const fs = require('fs');
const path = require('node:path');

const { trys_lentos }  = require('../utils/sqlQueries');

// exports.getAllUsers_old = async (req, res) => {
    
    // const { column = 'subscription_expires', sort = 'ASC'} = req.query;
    // const columns = 'id, name, email, role, subscription, subscription_type, initial_target, subscription_expires, assigned_plan, nutrition_tracking, nutrition_plan_status, support_over, last_activity';
    // let queryString = `SELECT ${columns} from users where role = $1 ORDER BY ${column} ${sort} NULLS LAST;`;
    // let queryParams = [2324];

    // if(column === 'subscription_type') {
    //     queryString = `SELECT ${columns} from users where role = $1 AND ${column} = $2;`;
    //     queryParams = [2324, 'free'];
    // }


    // const columns = 'users.id, name, email, role, subscription, subscription_type, initial_target, subscription_expires, assigned_plan, nutrition_tracking, nutrition_plan_status, support_over, last_activity, subscriptions.status as s_status, subscriptions.current_period_end as s_subscription_expires';
    // let queryString = `SELECT ${columns} from users LEFT JOIN subscriptions ON users.id = subscriptions.user_id where role = $1 ORDER BY ${column} ${sort} NULLS LAST;`;
    // let queryParams = [2324];

    // if(column === 'subscription_type') {
    //     queryString = `SELECT ${columns} from users LEFT JOIN subscriptions ON users.id = subscriptions.user_id where role = $1 AND ${column} = $2;`;
    //     queryParams = [2324, 'free'];
    // }

    // try {
    //     const data = await db.query(queryString, queryParams);
        
    //     res.status(200).json({
    //         users: data.rows
    //     });
    // } catch (err) {
    //     console.log(err.message);
    // }
// };

exports.getAllUsers = async (req, res) => {
    const { column, sort } = req.body;
    try {
        const columns = 'users.id, name, email, role, subscription, subscription_type, initial_target, subscription_expires, assigned_plan, nutrition_tracking, nutrition_plan_status, support_over, last_activity, subscriptions.status as s_status, subscriptions.current_period_end as s_subscription_expires';
        let queryString = `SELECT ${columns} from users LEFT JOIN subscriptions ON users.id = subscriptions.user_id where role = $1 ORDER BY ${column} ${sort} NULLS LAST;`;

        const data = await db.query(queryString, [2324]);        
        res.status(200).json({
            users: data.rows
        });
    } catch (err) {
        console.log(err.message);
    }
}

exports.updateUser = async (req, res) => {
    try {

        let { column, value } = req.body;
        if(value === '') value = null;
        let queryString = `UPDATE users SET ${column} = $1 WHERE id = $2;`;
        let queryParams = [value, req.params.id];
        
        if(column === 'subscription_expires') {
            const user = await db.query(`SELECT id, stripe_subscription_id, status from subscriptions where user_id = $1`, [req.params.id]);

            // jei Stripe subscription aktyvus
            if(user.rows.length) {
                queryString = `UPDATE users SET ${column} = $1 WHERE id = $2;`;
            // jei Stripe subscription neaktyvus
            } else {
                queryString = `UPDATE users SET ${column} = $1, subscription = $3, subscription_type = $4 WHERE id = $2;`;
                queryParams[2] = !!value;
                queryParams[3] = !!value ? 'Virtuvė' : 'free';
            }
        }

        if(column === 'assigned_plan' && value === null) {
            queryString = `UPDATE users SET ${column} = $1, support_over = $3 WHERE id = $2;`;
            queryParams[2] = 'none';
        }

    
        await db.query(queryString, queryParams);
        res.sendStatus(204);
    } catch (err) {
        console.log(err.message);
    }
};

exports.getAllVideos = async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM videos');
        res.status(200).json({
            videos: data.rows
        });
    } catch (err) {
        console.log(err.message);
    }
};

exports.getAllRows = table => {
    return async (req, res) => {
        try {
            const data = await db.query(`SELECT * FROM ${table} ORDER BY created_at DESC;`);
            res.status(200).json({
                [`${table}`]: data.rows
            });
        } catch (err) {
            console.log(err.message)
        }
    };
}

exports.getStats = async (req, res) => {
    try {
        const data = await db.query(`SELECT 
            (SELECT COUNT(*) FROM users WHERE role = 2324) AS users,
            (SELECT COUNT(*) FROM offers) AS mails,
            (SELECT count(*) from users WHERE subscription_type NOT LIKE 'free' AND role = 2324) AS active_subscriptions;`);

        res.status(200).json({
            data: data.rows[0]
        });
    } catch (err) {
        console.log(err.message)
    }
};

// exports.getPlans = async (req, res) => {
//     var queryString = fs.readFileSync(path.join(__dirname, '../', 'database', 'queries.sql')).toString();
//     var result = queryString.split('-- myselect');

//     console.log(trys_lentos)
    
//     try {
//         const data = await db.query(trys_lentos, ['7e5eca39-9f96-4e1d-b6b2-7972ca583cb9']);

//         res.status(200).json({
//             data: data.rows
//         });
//     } catch (err) {
//         console.log(err.message)
//     }
// };


