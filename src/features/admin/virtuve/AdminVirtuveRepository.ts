import type { Database } from '../../../common/config/db';
import type { AdmninVirtuveDto } from './types';
export class AdminVirtuveRepository {
	constructor(private readonly db: Database) {}

	async findAll(): Promise<AdmninVirtuveDto[]> {
		const query = `SELECT 
            v.id,
            v.title,
            v.description,
            v.category,
            v.duration,
            v.created_at AS "createdAt",
            v.views_snippet AS "viewsSnippet",
            v.views_full AS "viewsFull",
            v.is_active AS "isActive",
            v.image_s3_key AS "imageS3Key",
            v.video_s3_key AS "videoS3Key",
            v.video_tags AS "videoTags",
            v.participants,
            COUNT(DISTINCT(l.id))::INT AS "likesCount",
            COUNT(DISTINCT(c.id))::INT as "commentsCount"
        FROM videos AS v
        LEFT JOIN likes AS l 
            ON l.entity_id = v.id 
            AND l.entity_type = 'videos'
        LEFT JOIN comments AS c
            ON c.video_id = v.id
        WHERE v.is_active = TRUE
        GROUP BY v.id`;

		return await this.db.query(query);
	}
}
