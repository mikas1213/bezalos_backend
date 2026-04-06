import { Database } from '../../../common/config/db';
import { AppError } from '../../../common/errors/AppError';
import type { CommentsDto } from './CommentsSchema';
import type { CommentRow } from './types';

export class CommentsRepository {
	constructor(private readonly db: Database) {}

	async createComment(data: CommentsDto): Promise<void> {
		try {
			await this.db.queryOne(
				`INSERT INTO comments (video_id, user_id, comment, parent_id)
				VALUES ($1, $2, $3, $4)`,
				[data.videoId, data.userId, data.comment, data.parentId ?? null],
			);
		} catch (err) {
			let message = 'unknown error';
			if (err instanceof Error) message = err.message;
			throw AppError.internal(message);
		}
	}

	async findById(commentId: string): Promise<{ userId: string } | null> {
		try {
			return await this.db.queryOne<{ userId: string }>(`SELECT user_id AS "userId" FROM comments WHERE id = $1`, [
				commentId,
			]);
		} catch (err) {
			let message = 'unknown error';
			if (err instanceof Error) message = err.message;
			throw AppError.internal(message);
		}
	}

	async deleteById(commentId: string): Promise<void> {
		try {
			await this.db.queryOne(`DELETE FROM comments WHERE id = $1`, [commentId]);
		} catch (err) {
			let message = 'unknown error';
			if (err instanceof Error) message = err.message;
			throw AppError.internal(message);
		}
	}

	async getComments(videoId: string, userId: string | undefined): Promise<CommentRow[]> {
		const query = `SELECT COALESCE(json_agg(comments_tree), '[]') AS comments
            FROM (
                SELECT
                    c.id,
                    c.user_id AS "userId",
                    CASE WHEN u.role = 1213 THEN 'Be žalos' ELSE format_display_name(u.name) END AS "displayName",
                    c.comment,
                    c.created_at AS "createdAt",
                    (
                        SELECT COUNT(*)::INT FROM likes l
                        WHERE l.entity_id = c.id
                        AND l.entity_type = 'comments'
                    ) AS "likesCount",
                    (
                        SELECT EXISTS (
                            SELECT 1 FROM likes l
                            WHERE l.entity_id = c.id
                            AND l.user_id = $2
                            AND l.entity_type = 'comments'
                        )
                    ) AS "isLiked",
                    (
                        SELECT COALESCE(json_agg(replies), '[]')
                        FROM (
                            SELECT
                                r.id,
                                r.user_id AS "userId",
                                CASE WHEN ru.role = 1213 THEN 'Be žalos' ELSE format_display_name(ru.name) END AS "displayName",
                                r.comment,
                                r.created_at AS "createdAt",
                                (
                                    SELECT COUNT(*)::INT FROM likes l
                                    WHERE l.entity_id = r.id
                                    AND l.entity_type = 'comments'
                                ) AS "likesCount",
                                (
                                    SELECT EXISTS (
                                        SELECT 1 FROM likes l
                                        WHERE l.entity_id = r.id
                                        AND l.user_id = $2
                                        AND l.entity_type = 'comments'
                                    )
                                ) AS "isLiked"
                            FROM comments r
                            JOIN users ru ON ru.id = r.user_id
                            WHERE r.parent_id = c.id
                            ORDER BY r.created_at ASC
                        ) replies
                    ) AS replies
                FROM comments c
                JOIN users u ON u.id = c.user_id
                WHERE c.video_id = $1
                AND c.parent_id IS NULL
                ORDER BY c.created_at DESC
            ) comments_tree;`;
		try {
			const result = await this.db.queryOne<{ comments: CommentRow[] }>(query, [videoId, userId]);
			return result?.comments ?? [];
		} catch (err) {
			let message = 'unknown error';
			if (err instanceof Error) message = err.message;
			throw AppError.internal(message);
		}
	}
}
