const { Pool } = require('pg');
const pool = new Pool({
    user: 'mikas',
    host: 'localhost',
    database: 'bezalos',
    post: 5432
});

module.exports = {
    query: (text, params) => pool.query(text, params),
}