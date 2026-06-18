import { Request, Response } from 'express';
import { LikesService } from './LikesService';

export class LikesController {
	constructor(private readonly likesService: LikesService) {
		this.likesToggle = this.likesToggle.bind(this);
		this.getLikesCount = this.getLikesCount.bind(this);
	}

	async likesToggle(req: Request, res: Response): Promise<void> {
		const userId = req.user?.id;
		const { entityId, entityType } = req.body;
		const { isLiked, likesCount } = await this.likesService.toggleLikes(userId, entityType, entityId);

		res.status(200).json({ isLiked, likesCount });
	}

	async getLikesCount(req: Request, res: Response): Promise<void> {
		const userId = req.user?.id;
		const entityId = String(req.params.entityId);
		const { likesCount, isLiked } = await this.likesService.getLikesCount(userId, entityId);

		res.status(200).json({ likesCount, isLiked });
	}
}
