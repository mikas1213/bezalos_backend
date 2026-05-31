import { Database } from '../../../common/config/db';
import { AppError } from '../../../common/errors/AppError';

export class LikesRepository {
	constructor(private readonly db: Database) {
		this.db = db;
	}

	async findLike(userId: string | undefined, entity_id: string): Promise<{ user_id: string } | null> {
		try {
			return await this.db.queryOne(`SELECT user_id FROM likes WHERE user_id = $1 AND entity_id = $2`, [userId, entity_id]);
		} catch (err) {
			let message = 'unknown error';
			if (err instanceof Error) message = err.message;
			throw AppError.internal(message);
		}
	}

	async likesToggle(userId: string | undefined, entityType: string, entity_id: string) {
		try {
			return await this.db.queryOne('SELECT likes_toggle($1, $2, $3)', [userId, entityType, entity_id]);
		} catch (err) {
			let message = 'unknown error';
			if (err instanceof Error) message = err.message;
			throw AppError.internal(message);
		}
	}
}
