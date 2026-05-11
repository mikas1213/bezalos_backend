import type { Database } from '../../common/config/db';
import type { Category, Feature, TagType, TagsResult } from './types';

export class TagsRepository {
	constructor(private readonly db: Database) {
		this.db = db;
	}

	async findTags(feature: Feature): Promise<TagsResult> {
		let query = `
            SELECT category, array_agg(tag ORDER BY tag) AS tags
            FROM tags
            WHERE feature = $1
            GROUP BY category
        `;
		let params = [feature];

		if (feature === 'all') {
			query = `
                SELECT category, array_agg(tag ORDER BY tag) AS tags
                FROM tags
                GROUP BY category
            `;
			params = [];
		}
		const rows: { category: Category; tags: string[] }[] = await this.db.query(query, params);
		const categories = rows.find((r) => r.category === 'category')?.tags ?? [];
		const tags = rows.find((r) => r.category === 'tag')?.tags ?? [];

		return { categories, tags };
	}

	async addTag(feature: Feature, tag: string, type: TagType = 'tag'): Promise<void> {
		await this.db.query(
			`INSERT INTO tags (feature, category, tag) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
			[feature, type, tag],
		);
	}

	async deleteTag(feature: Feature, tag: string, type: TagType = 'tag'): Promise<void> {
		await this.db.query(`DELETE FROM tags WHERE feature = $1 AND category = $2 AND tag = $3`, [feature, type, tag]);
	}
}
