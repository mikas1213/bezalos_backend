import type { TagsService } from './TagsService';
import type { Request, Response } from 'express';

export class TagsController {
	constructor(private readonly tagsService: TagsService) {
		this.getTags = this.getTags.bind(this);
		this.addTag = this.addTag.bind(this);
		this.deleteTag = this.deleteTag.bind(this);
	}

	async getTags(req: Request, res: Response): Promise<void> {
		const { feature } = req.body;
		const data = await this.tagsService.getAllTags(feature);
		res.status(200).json(data);
	}

	async addTag(req: Request, res: Response): Promise<void> {
		const { feature, tag } = req.body;
		await this.tagsService.addTag(feature, tag);
		res.status(201).json({ status: 'success' });
	}

	async deleteTag(req: Request, res: Response): Promise<void> {
		const { feature, tag } = req.body;
		await this.tagsService.deleteTag(feature, tag);
		res.status(200).json({ status: 'success' });
	}
}
