import type { Request, Response } from 'express';
import type { SitemapService } from './SitemapService';

export class SitemapController {
	constructor(private readonly sitemapService: SitemapService) {
		this.getSitemap = this.getSitemap.bind(this);
	}

	async getSitemap(_req: Request, res: Response): Promise<void> {
		const xml = await this.sitemapService.generateSitemap();
		res.setHeader('Content-Type', 'application/xml');
		res.send(xml);
	}
}
