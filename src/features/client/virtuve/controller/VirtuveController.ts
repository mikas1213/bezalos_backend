import { Request, Response } from 'express';
import { VirtuveService } from '../service/VirtuveService';
import type { VirtuveQueryParams } from '../schemas/VirtuveQuerySchema';

export class VirtuveController {
	constructor(private readonly virtuveService: VirtuveService) {
		this.getVideos = this.getVideos.bind(this);
		this.getVideo = this.getVideo.bind(this);
		this.updateVideoPlayCount = this.updateVideoPlayCount.bind(this);
	}

	async getVideos(req: Request, res: Response): Promise<void> {
		const { c, f, s, page, limit } = req.query as unknown as VirtuveQueryParams;
		const result = await this.virtuveService.getAllVideos({ c, f, s, page, limit });
		res.status(200).json(result);
	}

	async getVideo(req: Request, res: Response): Promise<void> {
		const { slug } = req.params;
		const userId = req.user?.id;

		const data = await this.virtuveService.getOneVideo(slug, userId);
		res.status(200).json(data);
	}

	async updateVideoPlayCount(req: Request, res: Response): Promise<void> {
		const { id: video_id } = req.params;
		const { isSnippet } = req.body;

		await this.virtuveService.updateOneVideoPlayCount(video_id as string, isSnippet);
		res.sendStatus(204);
	}
}
