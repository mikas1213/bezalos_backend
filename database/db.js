const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// module.exports = {
//     query: (text, params) => pool.query(text, params),
// }

module.exports = {
    query: async (text, params) => {
        const client = await pool.connect(); // Get a client from the pool
        try {
            const res = await client.query(text, params); // Execute the query
            return res; // Return the result
        } catch (err) {
            throw err; // Re-throw any errors
        } finally {
            client.release(); // Release the client back to the pool
        }
    },
};
  