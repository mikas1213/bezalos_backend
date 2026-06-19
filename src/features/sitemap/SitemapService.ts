import type { SitemapRepository } from './SitemapRepository';
import { articlesSeo } from '../seo/articlesSeoData';

interface StaticPage {
	path: string;
	lastmod: string;
}

export class SitemapService {
	constructor(private readonly sitemapRepository: SitemapRepository) {}

	async generateSitemap(): Promise<string> {
		const [recipes, services, videos] = await Promise.all([
			this.sitemapRepository.findRecipes(),
			this.sitemapRepository.findServices(),
			this.sitemapRepository.findVideos(),
		]);

		const baseUrl =
			process.env.NODE_ENV === 'development'
				? 'http://localhost:5173'
				: process.env.PROJECT === 'DULEVICIUS'
					? 'https://bezalos.dulevicius.dev'
					: 'https://www.bezalos.lt';

		const staticPages: StaticPage[] = [
			{ path: '/', lastmod: '2025-03-07' },
			{ path: '/atlik-testa', lastmod: '2026-01-01' },
			{ path: '/virtuve', lastmod: '2026-04-01' },
			{ path: '/receptai', lastmod: '2026-04-01' },
			{ path: '/paslaugos', lastmod: '2026-04-01' },
			{ path: '/naryste', lastmod: '2026-04-01' },
			{ path: '/straipsniai', lastmod: '2026-06-15' },
			{ path: '/pirkimo-taisykles', lastmod: '2025-03-07' },
			{ path: '/privatumo-politika', lastmod: '2025-03-07' },
		];

		const urlEntry = (loc: string, lastmod: string) =>
			`\t<url>\n\t\t<loc>${loc}</loc>\n\t\t<lastmod>${lastmod}</lastmod>\n\t</url>\n`;

		let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
		xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

		staticPages.forEach(({ path, lastmod }) => {
			xml += urlEntry(`${baseUrl}${path}`, lastmod);
		});

		recipes.forEach(({ slug, updated_at }) => {
			xml += urlEntry(`${baseUrl}/receptai/${slug}`, updated_at.toISOString().split('T')[0]);
		});

		services.forEach(({ slug, updated_at }) => {
			xml += urlEntry(`${baseUrl}/paslaugos/${slug}`, updated_at.toISOString().split('T')[0]);
		});

		videos.forEach(({ slug, updated_at, created_at }) => {
			const lastmod = (updated_at ?? created_at).toISOString().split('T')[0];
			xml += urlEntry(`${baseUrl}/virtuve/${slug}`, lastmod);
		});

		articlesSeo.forEach(({ slug, lastmod }) => {
			xml += urlEntry(`${baseUrl}/straipsniai/${slug}`, lastmod);
		});

		xml += `</urlset>`;
		return xml;
	}
}
