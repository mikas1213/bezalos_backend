class SitemapService {
    constructor(recipesRepository, servicesRepository) {
        this.recipesRepository = recipesRepository;
        this.servicesRepository = servicesRepository;
    }   

    async generateSitemap() {
        const [recipes, services] = await Promise.all([
            this.recipesRepository.findAll({}, ['slug', 'updated_at']),
            this.servicesRepository.findAll({'is_active': true}, ['slug', 'updated_at'])
        ]);
        
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : process.env.PROJECT === 'DULEVICIUS' ? 'https://bezalos.dulevicius.dev' : 'https://www.bezalos.lt';
        const staticPages = ['/', '/virtuve', '/receptai', '/paslaugos', '/pirkimo-taisykles'];
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        
        staticPages.forEach(page => {
            xml += `\t<url>\n\t\t<loc>${baseUrl}${page}</loc>\n\t\t<lastmod>2025-03-07</lastmod>\n\t</url>\n`;
        });

        recipes.forEach(({ slug, updated_at }) => {
            xml += `\t<url>\n\t\t<loc>${baseUrl}/receptai/${slug}</loc>\n\t\t<lastmod>${updated_at.toISOString().split('T')[0]}</lastmod>\n\t</url>\n`;
        });

        services.forEach(({ slug, updated_at }) => {
            xml += `\t<url>\n\t\t<loc>${baseUrl}/paslaugos/${slug}</loc>\n\t\t<lastmod>${updated_at.toISOString().split('T')[0]}</lastmod>\n\t</url>\n`;
        });
        
        xml += `</urlset>`;
        return xml;
    }
}

module.exports = SitemapService;