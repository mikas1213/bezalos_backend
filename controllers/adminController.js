const db = require('../database/db');

exports.getAllUsers = async (req, res) => {
    
    const { column = 'subscription_expires', sort = 'ASC'} = req.query;
    // const columns = 'id, name, email, role, subscription, subscription_type, initial_target, subscription_expires, assigned_plan, nutrition_tracking, nutrition_plan_status, support_over, last_activity';
    // let queryString = `SELECT ${columns} from users where role = $1 ORDER BY ${column} ${sort} NULLS LAST;`;
    // let queryParams = [2324];

    // if(column === 'subscription_type') {
    //     queryString = `SELECT ${columns} from users where role = $1 AND ${column} = $2;`;
    //     queryParams = [2324, 'free'];
    // }








    
    const columns = 'users.id, name, email, role, subscription, subscription_type, initial_target, subscription_expires, assigned_plan, nutrition_tracking, nutrition_plan_status, support_over, last_activity, subscriptions.status as s_status, subscriptions.current_period_end as s_subscription_expires';
    let queryString = `SELECT ${columns} from users LEFT JOIN subscriptions ON users.id = subscriptions.user_id where role = $1 ORDER BY ${column} ${sort} NULLS LAST;`;
    let queryParams = [2324];

    if(column === 'subscription_type') {
        queryString = `SELECT ${columns} from users LEFT JOIN subscriptions ON users.id = subscriptions.user_id where role = $1 AND ${column} = $2;`;
        queryParams = [2324, 'free'];
    }











    try {
        const data = await db.query(queryString, queryParams);
        
        res.status(200).json({
            users: data.rows
        });
    } catch (err) {
        console.log(err.message);
    }
};

exports.updateUser = async (req, res) => {
    let { column, value } = req.body;
    if(value === '') value = null;
    
    let queryString = `UPDATE users SET ${column} = $1 WHERE id = $2;`;
    let queryParams = [value, req.params.id];
    
    if(column === 'subscription_expires') {
        queryString = `UPDATE users SET ${column} = $1, subscription = $3, subscription_type = $4 WHERE id = $2;`;
        queryParams[2] = !!value;
        queryParams[3] = !!value ? 'Virtuvė' : 'free';
    }

    if(column === 'assigned_plan' && value === null) {
        queryString = `UPDATE users SET ${column} = $1, support_over = $3 WHERE id = $2;`;
        queryParams[2] = 'none';
    }
    try {
        await db.query(queryString, queryParams);
        res.sendStatus(204);
    } catch (err) {
        console.log(err.message);
    }
};

exports.getAllVideos = async (req, res) => {
    let queryString = 'SELECT * FROM videos';
    let queryParams = [];

    try {
        const data = await db.query(queryString);
        res.status(200).json({
            videos: data.rows
        });
    } catch (err) {
        console.log(err.message);
    }
};

