import { S3Service } from '../../../services/S3/S3Service';
import type { AdminVirtuveRepository } from './AdminVirtuveRepository';
import type { DeleteRequestDto } from './types';

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
