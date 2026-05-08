import type { Database } from '../../common/config/db';
import type { Category, Feature, TagsResult } from './types';

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
}
