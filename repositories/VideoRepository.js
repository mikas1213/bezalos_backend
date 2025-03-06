const { DatabaseError } = require('../utils/errors');
const BaseRepository = require('./BaseRepository');

class VideoRepository extends BaseRepository {
    constructor(db) {
        const mappings = { 'cat': 'search_tag', 'search': 'title' };
        super(db, 'videos', mappings);
    }

    async findById(userId, videoUrl) {
        const query = `
            SELECT 
                v.*,
                COALESCE(json_agg(c ORDER BY c.created_at DESC) FILTER (WHERE c.id IS NOT NULL), '[]') AS video_comments,
                (SELECT COUNT(*) FROM likes_videos WHERE video_id = v.id) AS likes_count,
                EXISTS (
                    SELECT 1 FROM likes_videos WHERE video_id = v.id AND user_id = $2
                ) AS is_liked
            FROM videos v
            LEFT JOIN comments c ON v.id = c.video_id
            WHERE v.video_type = $1 AND v.video_url = $3
            GROUP BY v.id;
        `;
        try {
            const data = await this.db.query(query, ['virtuve', userId, videoUrl]);
            return data.length ? data[0] : null;
        } catch(err) {
            throw new DatabaseError(err.message, err);
        }
    }
}

module.exports = VideoRepository;