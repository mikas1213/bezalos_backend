import { Pool, QueryResult, QueryResultRow } from 'pg';
import { AppError } from '../errors/AppError';

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
});

pool.on('error', (err: Error) => {
	console.error('Database connection erro:', err);
	throw new AppError('Database connection error', 500);
});

type QueryParams = any[] | undefined;
type QueryResultRows<T extends QueryResultRow = QueryResultRow> = T[];

export interface DB {
	query<T extends QueryResultRow = QueryResultRow>(
		query: string,
		params?: QueryParams
	): Promise<QueryResultRows<T>>;
}

export const db: DB = {
	async query<T extends QueryResultRow = QueryResultRow>(
		query: string,
		params?: QueryParams
	): Promise<QueryResultRows<T>> {
		const client = await pool.connect();
		try {
			const start = Date.now();
			const res: QueryResult<T> = await client.query(query, params);
			const duration = Date.now() - start;
			// console.log(`Įvykdyta užklausa: ${query}, trukmė: ${duration}ms, eilučių: ${res.rowCount}`);
			return res.rows;
		} catch (err: any) {
			// console.error("❌ Database error:", err);
			throw new AppError(err.message, 500);
		} finally {
			client.release();
		}
	},
};
