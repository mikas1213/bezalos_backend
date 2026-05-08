import fs from 'fs';
import { randomUUID } from 'crypto';
import { S3Service } from '../../../services/S3/S3Service';
import type { AdminVirtuveRepository } from './AdminVirtuveRepository';
import type { DeleteRequestDto } from './types';
import type { VideoDto } from './VideoDto';

type MulterFiles = { [fieldname: string]: Express.Multer.File[] };
export class AdminVirtuveService {
	private s3Service: S3Service;
	private adminVirtuveRepository: AdminVirtuveRepository;

	constructor(adminVirtuveRepository: AdminVirtuveRepository, s3Service: S3Service) {
		this.adminVirtuveRepository = adminVirtuveRepository;
		this.s3Service = s3Service;
	}

	async getAllVideos() {
		return await this.adminVirtuveRepository.findAll();
	}

	async addOneVideo(videoDto: VideoDto, files: MulterFiles, socketId: string | string[] | undefined) {
		const videoFile = files.video[0];
		const photoFile = files.photo[0];
		const videoExtention = videoFile.originalname.split('.').pop();
		const imageExtention = photoFile.originalname.split('.').pop();
		const normalizedSocketId = Array.isArray(socketId) ? socketId[0] : (socketId ?? null);

		const videoId = randomUUID();
		const videoData: VideoDto = {
			...videoDto,
			id: videoId,
			imageS3Key: `${process.env.AWS_FOLDER_NAME}/images/virtuve-video-covers/${videoDto.slug}.${imageExtention}`,
			videoS3Key: `${process.env.AWS_FOLDER_NAME}/videos/virtuve/full/${videoDto.slug}.${videoExtention}`,
			videoS3SnippetKey: `${process.env.AWS_FOLDER_NAME}/videos/virtuve/snippet/${videoDto.slug}.${videoExtention}`,
		};

		let photoUploaded = false;
		let videoUploaded = false;

		try {
			await this.s3Service.uploadFileDisk(photoFile, videoData.imageS3Key!, videoId);
			photoUploaded = true;

			await this.s3Service.uploadVideo(videoFile, videoData.videoS3Key!, videoId, normalizedSocketId);
			videoUploaded = true;

			await this.adminVirtuveRepository.create(videoData);
		} catch (err) {
			if (videoFile.path && fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
			if (photoFile.path && fs.existsSync(photoFile.path)) fs.unlinkSync(photoFile.path);

			if (photoUploaded) {
				await this.s3Service.deleteFile({ Bucket: process.env.AWS_BUCKET_NAME!, Key: videoData.imageS3Key! });
			}
			if (videoUploaded) {
				await this.s3Service.deleteFile({ Bucket: process.env.AWS_BUCKET_NAME!, Key: videoData.videoS3Key! });
			}

			if (normalizedSocketId && global.io) {
				global.io.to(normalizedSocketId).emit('uploadError', { message: 'Video įkėlimas nepavyko' });
			}

			throw err;
		}
	}

	async deleteOneVideo({ videoId, videoS3Key, imageS3Key, videoS3SnippetKey }: DeleteRequestDto) {
		await this.s3Service.deleteFile({
			Bucket: process.env.AWS_BUCKET_NAME!,
			Key: imageS3Key,
		});
		await this.s3Service.deleteFile({
			Bucket: process.env.AWS_BUCKET_NAME!,
			Key: videoS3Key,
		});
		await this.s3Service.deleteFile({
			Bucket: process.env.AWS_BUCKET_NAME!,
			Key: videoS3SnippetKey,
		});
		await this.adminVirtuveRepository.deleteById(videoId);
	}
}
