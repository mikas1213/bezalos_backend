const { SITEMAP_SERVICE } = require('../config/DIKeys');
const appContainer = require('../utils/appContainer');
const sitemapService = appContainer.resolve(SITEMAP_SERVICE);
const catchAsync = require('../utils/catchAsync');

exports.getSitemap = catchAsync(async (req, res) => {
    const xml = await sitemapService.generateSitemap();
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
});
