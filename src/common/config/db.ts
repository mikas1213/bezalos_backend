import { Pool, QueryResult, QueryResultRow } from 'pg';
import { AppError } from '../errors/AppError';

type QueryParams = any[] | undefined;
type QueryResultRows<T extends QueryResultRow = QueryResultRow> = T[];

export interface TransactionClient {
	query<T extends QueryResultRow = QueryResultRow>(
		query: string,
		params?: QueryParams,
	): Promise<QueryResultRows<T>>;
}

export class Database {
	private pool: Pool;

	constructor() {
		this.pool = new Pool({
			user: process.env.DB_USER,
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			password: process.env.DB_PASSWORD,
			port: process.env.DB_PORT
				? parseInt(process.env.DB_PORT, 10)
				: undefined,
		});

		this.pool.on('error', (err: Error) => {
			console.error('Database connection error:', err);
			throw AppError.internal('Database connection error');
		});
	}

	async query<T extends QueryResultRow = QueryResultRow>(
		query: string,
		params?: QueryParams,
	): Promise<QueryResultRows<T>> {
		const client = await this.pool.connect();
		try {
			const res: QueryResult<T> = await client.query(query, params);
			return res.rows;
		} catch (err: any) {
			throw AppError.internal(err.message);
		} finally {
			client.release();
		}
	}

	async transaction<T>(
		callback: (client: TransactionClient) => Promise<T>,
	): Promise<T> {
		const client = await this.pool.connect();

		try {
			await client.query('BEGIN');

			const transactionClient: TransactionClient = {
				async query<T extends QueryResultRow = QueryResultRow>(
					query: string,
					params?: QueryParams,
				): Promise<QueryResultRows<T>> {
					const res: QueryResult<T> = await client.query(
						query,
						params,
					);
					return res.rows;
				},
			};

			const result = await callback(transactionClient);
			await client.query('COMMIT');
			return result;
		} catch (err: any) {
			await client.query('ROLLBACK');
			throw AppError.internal(err.message);
		} finally {
			client.release();
		}
	}

	async close(): Promise<void> {
		await this.pool.end();
	}
}
