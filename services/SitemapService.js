class SitemapService {
	constructor(recipesRepository, servicesRepository, videosRepository) {
		this.recipesRepository = recipesRepository;
		this.servicesRepository = servicesRepository;
		this.videosRepository = videosRepository;
	}

	async generateSitemap() {
		const [recipes, services, videos] = await Promise.all([
			this.recipesRepository.findAll({}, ['slug', 'updated_at']),
			this.servicesRepository.findAll({ is_active: true }, ['slug', 'updated_at']),
			this.videosRepository.findAll({ is_active: true }, ['slug', 'updated_at', 'created_at']),
		]);

		const baseUrl =
			process.env.NODE_ENV === 'development'
				? 'http://localhost:5173'
				: process.env.PROJECT === 'DULEVICIUS'
					? 'https://bezalos.dulevicius.dev'
					: 'https://www.bezalos.lt';

		const staticPages = [
			{ path: '/', lastmod: '2025-03-07', priority: '1.0', changefreq: 'weekly' },
			{ path: '/virtuve', lastmod: '2025-03-07', priority: '0.8', changefreq: 'weekly' },
			{ path: '/receptai', lastmod: '2025-03-07', priority: '0.8', changefreq: 'weekly' },
			{ path: '/paslaugos', lastmod: '2025-03-07', priority: '0.8', changefreq: 'weekly' },
			{ path: '/atlik-testa', lastmod: '2025-03-07', priority: '0.6', changefreq: 'monthly' },
			{ path: '/pirkimo-taisykles', lastmod: '2025-03-07', priority: '0.5', changefreq: 'yearly' },
			{ path: '/privatumo-politika', lastmod: '2025-03-07', priority: '0.5', changefreq: 'yearly' },
		];

		const urlEntry = (loc, lastmod, priority, changefreq) =>
			`\t<url>\n\t\t<loc>${loc}</loc>\n\t\t<lastmod>${lastmod}</lastmod>\n\t\t<changefreq>${changefreq}</changefreq>\n\t\t<priority>${priority}</priority>\n\t</url>\n`;

		let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
		xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

		staticPages.forEach(({ path, lastmod, priority, changefreq }) => {
			xml += urlEntry(`${baseUrl}${path}`, lastmod, priority, changefreq);
		});

		recipes.forEach(({ slug, updated_at }) => {
			xml += urlEntry(`${baseUrl}/receptai/${slug}`, updated_at.toISOString().split('T')[0], '0.7', 'monthly');
		});

		services.forEach(({ slug, updated_at }) => {
			xml += urlEntry(`${baseUrl}/paslaugos/${slug}`, updated_at.toISOString().split('T')[0], '0.7', 'monthly');
		});

		videos.forEach(({ slug, updated_at, created_at }) => {
			const lastmod = (updated_at || created_at).toISOString().split('T')[0];
			xml += urlEntry(`${baseUrl}/virtuve/${slug}`, lastmod, '0.6', 'monthly');
		});

		xml += `</urlset>`;
		return xml;
	}
}

module.exports = SitemapService;
