const db = require('../database/db');

exports.getUsers = async (req, res, next) => {
    try {
        // const data = await db.query('SELECT * from users where role = 2324 ORDER BY subscription_expires ASC;');
        const data = await db.query('SELECT * from users where role = 2324 ORDER BY subscription_expires ASC;');
        res.status(200).json({
            users: data.rows
        });
    } catch (err) {
        console.log(err.message);
    }
};

exports.updateUser = async (req, res) => {
    let { column, value } = req.body;
    
    let queryString = `UPDATE users SET ${column} = $1 WHERE id = $2;`;
    let queryParams = [value, req.params.id];
    
    if(column === 'nutrition_tracking') {
        value === '' ? queryParams[0] = null : queryParams[0] = `${value}`;
    }

    if(column === 'subscription_expires') {
        value === '' ? queryParams[0] = null : queryParams[0] = `${value}`;
        queryString = `UPDATE users SET ${column} = $1, subscription = $3, subscription_type = $4 WHERE id = $2;`;
        queryParams[2] = !!value;
        queryParams[3] = !!value ? 'Virtuvė' : 'free';
    }

    try {
        await db.query(queryString, queryParams);
        res.sendStatus(204);
    } catch (err) {
        console.log(err.message);
    }
};