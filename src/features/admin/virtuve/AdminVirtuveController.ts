import { Request, Response } from 'express';
import type { AdminVirtuveService } from './AdminVirtuveService';
import { VideoDto } from './VideoDto';
type MulterFiles = { [fieldname: string]: Express.Multer.File[] };

export class AdminVirtuveController {
	constructor(private readonly adminVirtuveService: AdminVirtuveService) {
		this.getAllVideos = this.getAllVideos.bind(this);
		this.addVideo = this.addVideo.bind(this);
		this.deleteVideo = this.deleteVideo.bind(this);
	}

	async getAllVideos(_req: Request, res: Response) {
		const data = await this.adminVirtuveService.getAllVideos();
		res.status(200).json(data);
	}

	async addVideo(req: Request, res: Response) {
		const socketId = req.headers['x-socket-id'];
		const videoDto = new VideoDto(req.body);
		res.status(201).json({ success: true, message: 'Upload started' });

		(async () => {
			try {
				await this.adminVirtuveService.addOneVideo(videoDto, req.files as MulterFiles, socketId);
				console.log('✅ Video upload completed');
			} catch (err) {
				console.error('❌ Background upload error:', err);
				if (socketId && global.io) {
					const message = err instanceof Error ? err.message : 'Video įkėlimas nepavyko';
					global.io.to(socketId).emit('uploadError', { message });
				}
			}
		})();
	}

	async deleteVideo(req: Request, res: Response) {
		const { imageS3Key, videoS3Key, videoS3SnippetKey } = req.body;
		const videoId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		await this.adminVirtuveService.deleteOneVideo({ videoId, videoS3Key, imageS3Key, videoS3SnippetKey });
		res.sendStatus(204);
	}
}
