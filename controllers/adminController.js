const db = require('../database/db');

exports.getUsers = async (req, res) => {
    console.log(req.query)
    const { column = 'subscription_expires', sort = 'ASC'} = req.query;
    let queryString = `SELECT * from users where role = $1 ORDER BY ${column} ${sort} NULLS LAST;`;
    let queryParams = [2324];

    if(column === 'subscription_type') {
        queryString = `SELECT * from users where role = $1 AND ${column} = $2;`;
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

    try {
        await db.query(queryString, queryParams);
        res.sendStatus(204);
    } catch (err) {
        console.log(err.message);
    }
};