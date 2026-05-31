import { Request, Response } from 'express';
import { LikesService } from './LikesService';

export class LikesController {
	constructor(private readonly likesService: LikesService) {
		this.likesToggle = this.likesToggle.bind(this);
	}

	async likesToggle(req: Request, res: Response): Promise<void> {
		const userId = req.user?.id;
		const { entityId, entityType } = req.body;
		const { isLiked, likesCount } = await this.likesService.toggleLikes(userId, entityType, entityId);

		res.status(200).json({ isLiked, likesCount });
	}
}
