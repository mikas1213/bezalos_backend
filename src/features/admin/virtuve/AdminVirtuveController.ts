import { Request, Response } from 'express';
import type { AdminVirtuveService } from './AdminVirtuveService';

export class AdminVirtuveController {
	constructor(private readonly adminVirtuveService: AdminVirtuveService) {
		this.getAllVideos = this.getAllVideos.bind(this);
	}
	async getAllVideos(_req: Request, res: Response) {
		const data = await this.adminVirtuveService.getAllVideos();
		res.status(200).json(data);
	}

	// async addVideo(req: Response, res: Request) {
	// 	const socketId = req.headers['x-socket-id'] as string | undefined;
	// 	const videoDTO = new VideoDTO(req.body);

	// 	res.status(201).json({ success: true, message: 'Upload started' });

	// 	(async () => {
	// 		try {
	// 			await videoService.addOneVideo(videoDTO, req.files, socketId);
	// 			console.log('✅ Video upload completed');
	// 		} catch (err) {
	// 			const error = err as Error;
	// 			console.error('❌ Background upload error:', err);
	// 			if (socketId && global.io) {
	// 				global.io.to(socketId).emit('uploadError', {
	// 					message: error.message || 'Video įkėlimas nepavyko',
	// 				});
	// 			}
	// 		}
	// 	})();
	// }
}
