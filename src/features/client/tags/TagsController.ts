import type { TagsService } from './TagsService';
import type { Request, Response, NextFunction } from 'express';

export class TagsController {
	constructor(private readonly tagsService: TagsService) {
		this.getVirtuveFilters = this.getVirtuveFilters.bind(this);
	}

	async getVirtuveFilters(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const data = await this.tagsService.getFilters('virtuve');

			res.status(200).json(data);
		} catch (err) {
			next(err);
		}
	}

	async getReceptaiFilters(req: Request, res: Response): Promise<void> {
		const data = await this.tagsService.getFilters('receptai');

		res.status(200).json(data);
	}
}
