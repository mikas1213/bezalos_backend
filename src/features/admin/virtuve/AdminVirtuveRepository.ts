import type { Database } from '../../../common/config/db';
import type { AdmninVirtuveDto } from './types';
import type { VideoDto } from './VideoDto';
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
            v.video_s3_snippet_key AS "videoS3SnippetKey",
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
        GROUP BY v.id`;

		return await this.db.query(query);
	}
	async create(videoData: VideoDto): Promise<{ id: string } | null> {
		const {
			id,
			title,
			slug,
			participants,
			description,
			category,
			duration,
			isActive,
			videoTags,
			imageS3Key,
			videoS3Key,
			videoS3SnippetKey,
		} = videoData;
		const query = `
            INSERT INTO videos(
                id,
                title,
                slug,
                participants,
                description,
                category,
                duration,
                is_active,
                video_tags,
                image_s3_key,
                video_s3_key,
                video_s3_snippet_key
            )
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id;
        `;
		const params: unknown[] = [
			id,
			title,
			slug,
			participants,
			description,
			category,
			duration,
			isActive,
			typeof videoTags === 'string' ? JSON.parse(videoTags) : (videoTags ?? []),
			imageS3Key,
			videoS3Key,
			videoS3SnippetKey,
		];

		return await this.db.queryOne(query, params);
	}

	async updateById(id: string, data: VideoDto): Promise<void> {
		const {
			title,
			slug,
			participants,
			description,
			category,
			duration,
			isActive,
			videoTags,
			imageS3Key,
			videoS3Key,
			videoS3SnippetKey,
		} = data;
		const query = `
            UPDATE videos SET
                title = $1,
                slug = $2,
                participants = $3,
                description = $4,
                category = $5,
                duration = $6,
                is_active = $7,
                video_tags = $8,
                image_s3_key = $9,
                video_s3_key = $10,
                video_s3_snippet_key = $11,
                updated_at = NOW()
            WHERE id = $12
        `;
		const params: unknown[] = [
			title,
			slug,
			participants,
			description,
			category,
			duration,
			isActive,
			typeof videoTags === 'string' ? JSON.parse(videoTags) : (videoTags ?? []),
			imageS3Key,
			videoS3Key,
			videoS3SnippetKey,
			id,
		];
		await this.db.query(query, params);
	}

	async deleteById(video_id: string): Promise<void> {
		await this.db.query(`DELETE FROM videos WHERE id = $1`, [video_id]);
	}
}
