import type { TagsService } from './TagsService';
import type { Request, Response } from 'express';

export class TagsController {
	constructor(private readonly tagsService: TagsService) {
		this.getTags = this.getTags.bind(this);
	}

	async getTags(req: Request, res: Response): Promise<void> {
		const { feature } = req.body;
		const data = await this.tagsService.getAllTags(feature);
		res.status(200).json(data);
	}
}
