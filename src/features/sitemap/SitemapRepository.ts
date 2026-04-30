import type { Database } from '../../common/config/db';

export class SitemapRepository {
	constructor(private readonly db: Database) {}

	async findRecipes(): Promise<{ slug: string; updated_at: Date }[]> {
		return this.db.query(`SELECT slug, updated_at FROM recipes`);
	}

	async findServices(): Promise<{ slug: string; updated_at: Date }[]> {
		return this.db.query(`SELECT slug, updated_at FROM services WHERE is_active = true`);
	}

	async findVideos(): Promise<{ slug: string; updated_at: Date | null; created_at: Date }[]> {
		return this.db.query(`SELECT slug, updated_at, created_at FROM videos WHERE is_active = true`);
	}
}
