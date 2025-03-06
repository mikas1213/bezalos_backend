const { Pool } = require('pg');
const { DatabaseError } = require('../utils/errors');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

pool.on('error', (err) => {
    console.error('Database connection erro:', err);
    throw new DatabaseError('Database connection error', err);
});

const db = {
    query: async (query, params) => {
        const client = await pool.connect();
        try {
            const start = Date.now();
            const res = await client.query(query, params);
            const duration = Date.now() - start;
            // console.log(`Įvykdyta užklausa: ${query}, trukmė: ${duration}ms, eilučių: ${res.rowCount}`);
            return res.rows;
        } catch (err) {
            // console.error("❌ Database error:", err);
            throw new DatabaseError(err.message, err);
        } finally {
            client.release();
        }
    }
};

module.exports = db;