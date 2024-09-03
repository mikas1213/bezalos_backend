const db = require('../../database/db');
const fs = require('fs');
const path = require('node:path');
const { trys_lentos }  = require('../../utils/sqlQueries');


exports.getPlans = async (req, res) => {
    var queryString = fs.readFileSync(path.join(__dirname, '../', '../', 'database', 'queries.sql')).toString();
    var result = queryString.split('-- myselect');

    // console.log(trys_lentos)
    
    try {
        const data = await db.query(trys_lentos, ['7e5eca39-9f96-4e1d-b6b2-7972ca583cb9']);
        console.log(data.rows)
        res.status(200).json({
            data: data.rows
        });
    } catch (err) {
        console.log(err.message)
    }
};