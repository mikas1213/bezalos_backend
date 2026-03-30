const { DatabaseError } = require('../utils/errors');
const BaseRepository = require('./BaseRepository');

class VideoRepository extends BaseRepository {
	constructor(db) {
		const mappings = {
			is_active: 'is_active',
			cat: 'search_tag',
			search: 'title',
			type: 'video_type',
		};
		super(db, 'videos', mappings);
	}

	async findAllAdmin() {
		const query = `SELECT 
            v.*,
            COALESCE(l.likes_count, 0)::FLOAT AS likes_count,
            COALESCE(c.comments_count, 0)::FLOAT AS comments_count
        FROM videos v
        LEFT JOIN (
            SELECT 
                entity_id,
                COUNT(*) AS likes_count
            FROM likes
            WHERE category_id = (
                SELECT id 
                FROM like_categories 
                WHERE category_name = 'video'
            )
            GROUP BY entity_id
        ) l ON v.id = l.entity_id
        LEFT JOIN (
            SELECT 
                video_id,
                COUNT(*) AS comments_count
            FROM comments
            GROUP BY video_id
        ) c ON v.id = c.video_id ORDER BY v.created_at DESC;`;

		try {
			const data = await this.db.query(query);
			return data.length ? data : null;
		} catch (err) {
			throw new DatabaseError(err.message, err);
		}
	}

	// async findById(userId, videoUrl) {
	// 	const query = `
	//         SELECT v.*,
	//             COALESCE(json_agg(c ORDER BY c.created_at DESC) FILTER (WHERE c.id IS NOT NULL), '[]') AS video_comments,
	//             (SELECT COUNT(*) FROM likes WHERE entity_id = v.id AND category_id = $2) AS likes_count,
	//             EXISTS (
	//                 SELECT 1 FROM likes WHERE entity_id = v.id AND user_id = $1 AND category_id = $2
	//             ) AS is_liked
	//         FROM videos v
	//         LEFT JOIN comments c ON v.id = c.video_id
	//         WHERE v.slug = $3
	//         GROUP BY v.id;
	//     `;

	// 	try {
	// 		const cat = await this.db.query(
	// 			`SELECT id FROM like_categories WHERE category_name = 'video'`,
	// 		);
	// 		const data = await this.db.query(query, [userId, cat[0].id, videoUrl]);
	// 		return data.length ? data[0] : null;
	// 	} catch (err) {
	// 		throw new DatabaseError(err.message, err);
	// 	}
	// }

	// async updateVideoPlayCount(video_id, column) {
	// 	const valid_columns = ['play_count', 'play_count_25', 'play_count_50', 'play_count_80'];

	// 	if (!valid_columns.includes(column)) {
	// 		throw new DatabaseError('bad column');
	// 	}

	// 	try {
	// 		const data = await this.db.query(
	// 			`UPDATE videos SET ${column} = ${column} + 1 WHERE id = $1`,
	// 			[video_id],
	// 		);
	// 	} catch (err) {
	// 		throw new DatabaseError(err.message, err);
	// 	}
	// }
}

module.exports = VideoRepository;
