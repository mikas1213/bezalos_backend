import { Database } from '../../../../common/config/db';
import { AppError } from '../../../../common/errors/AppError';
import type { VideoRowWithCount, UserSubscriptionRow, UserCourseOrderRow, VideosDto, VideoDto, VideoRow } from './types';
import type { VirtuveQueryParams } from '../schemas/VirtuveQuerySchema';

export class VirtuveRepository {
	constructor(private readonly db: Database) {
		this.db = db;
	}

	async findAll({ c, f, s, page = 1, limit = 9 }: VirtuveQueryParams): Promise<VideosDto> {
		const conditions: string[] = [];
		const params: unknown[] = [];

		if (c) {
			params.push(c);
			conditions.push(`v.category = $${params.length}`);
		}

		if (f) {
			params.push(f);
			conditions.push(`$${params.length} = ANY(v.video_tags)`);
		}

		if (s) {
			params.push(`%${s}%`);
			conditions.push(`v.title ILIKE $${params.length}`);
		}

		const where =
			conditions.length > 0 ? `WHERE v.is_active = TRUE AND ${conditions.join(' AND ')}` : `WHERE v.is_active = TRUE`;

		const offset = (page - 1) * limit;
		params.push(limit);
		const limitIdx = params.length;
		params.push(offset);
		const offsetIdx = params.length;

		const query = `
            SELECT
                v.image_s3_key,
                v.category,
                v.duration,
                v.title,
                v.description,
                v.created_at,
                v.video_tags,
                v.views_total,
                v.slug,
                COUNT(DISTINCT c.id)::int AS comment_count,
                COUNT(DISTINCT l.id)::int AS likes_count,
                COUNT(*) OVER()::int AS total_count
            FROM videos v
            LEFT JOIN comments c ON c.video_id = v.id
            LEFT JOIN likes l ON l.entity_id = v.id
                AND l.entity_type = 'videos'
            ${where}
            GROUP BY v.id
            ORDER BY v.created_at DESC
            LIMIT $${limitIdx} OFFSET $${offsetIdx}
        `;

		const rows = await this.db.query<VideoRowWithCount>(query, params);
		const total = rows[0]?.total_count ?? 0;
		const data = rows.map(({ total_count, ...row }) => row as VideoRow);

		return { data, total, page, limit };
	}

	async findById(userId: string | undefined, slug: string | string[]): Promise<VideoDto | null> {
		try {
			const query = `SELECT 
                v.id, 
                v.category, 
                v.title, 
                v.description, 
                v.duration, 
                v.created_at, 
                v.is_active, 
                v.slug, 
                v.views_total, 
                v.video_s3_snippet_key,
                v.video_s3_key, 
                v.image_s3_key, 
                v.video_tags, 
                v.participants,
                (
                    SELECT COUNT(*)::INT FROM likes l
                    WHERE l.entity_id = v.id 
                    AND l.entity_type = 'videos'
                ) AS likes_count,
                EXISTS (
                    SELECT 1 FROM likes l
                    WHERE l.entity_id = v.id 
                    AND l.user_id = $1 
                    AND l.entity_type = 'videos'
                ) AS is_liked
            FROM videos v
            WHERE v.slug = $2
            GROUP BY v.id;`;

			return await this.db.queryOne(query, [userId, slug]);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Server error';
			throw AppError.internal(message);
		}
	}

	async getUserSubscription(userId: string): Promise<UserSubscriptionRow | null> {
		const query = `
            SELECT 
                COALESCE(s.status, u.subscription_type) AS status,
                COALESCE(s.current_period_end, u.subscription_expires) AS expires
            FROM users u
            LEFT JOIN subscriptions s ON u.id = s.user_id
            WHERE u.id = $1
            ORDER BY s.created_at DESC NULLS LAST
            LIMIT 1
        `;
		return await this.db.queryOne<UserSubscriptionRow>(query, [userId]);
	}

	async getUserCourseAccess(userId: string): Promise<UserCourseOrderRow | null> {
		const query = `
			SELECT 
				CASE 
					WHEN o.created_at IS NULL THEN false
					WHEN (CURRENT_TIMESTAMP - o.created_at) <= INTERVAL '90 days' THEN true
					ELSE false
				END AS is_course
			FROM orders o
			LEFT JOIN services s ON s.id = o.service_id
			WHERE o.user_id = $1 AND s.category = 'Kursai'
			ORDER BY o.created_at DESC
			LIMIT 1
		`;

		return await this.db.queryOne<UserCourseOrderRow>(query, [userId]);
	}

	async updateVideoPlayCount(video_id: string, isSnippet: boolean): Promise<void> {
		try {
			const column = isSnippet ? 'views_snippet' : 'views_full';
			const queryString = `UPDATE videos SET views_total = views_total + 1, ${column} = ${column} + 1 WHERE id = $1`;
			await this.db.queryOne(queryString, [video_id]);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Server error';
			throw AppError.internal(message);
		}
	}
}
