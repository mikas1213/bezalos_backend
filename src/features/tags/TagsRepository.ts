import type { Database } from '../../common/config/db';
import type { Feature, TagsResult } from './types';

export class TagsRepository {
	constructor(private readonly db: Database) {
		this.db = db;
	}

	async findTags(feature: Feature): Promise<TagsResult> {
		const query = `
            SELECT category, array_agg(tag ORDER BY tag) AS tags
            FROM tags
            WHERE feature = $1
            GROUP BY category
        `;
		const rows: { category: string; tags: string[] }[] = await this.db.query(query, [feature]);

		return {
			categories: rows.find((r) => r.category === 'category')?.tags ?? [],
			tags: rows.find((r) => r.category === 'tag')?.tags ?? [],
		};
	}
}
