const { DatabaseError } = require('../utils/errors');

class LikesRepository {
	constructor(db) {
		this.db = db;
		this.tableName = 'likes';
	}

	async likesToggle(user_id, category, entity_id) {
		try {
			const data = await this.db.query('SELECT likes_toggle($1, $2, $3)', [user_id, category, entity_id]);
			return data.length ? data[0] : null;
		} catch (err) {
			throw new DatabaseError(err.message, err);
		}
	}

	async findLike(user_id, entity_id) {
		try {
			return await this.db.query(`SELECT user_id FROM ${this.tableName} WHERE user_id = $1 AND entity_id = $2`, [
				user_id,
				entity_id,
			]);
		} catch (err) {
			throw new DatabaseError(err.message, err);
		}
	}
}

module.exports = LikesRepository;
