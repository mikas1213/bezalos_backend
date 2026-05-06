// import { VirtuveRepository } from '../repository/VirtuveRepository';
// import { S3Service } from '../../../../services/S3/S3Service';
// import { AppError } from '../../../../common/errors/AppError';
// import type { VirtuveQueryParams } from '../schemas/VirtuveQuerySchema';
// import type { VideosDto } from '../repository/types';
// import type { VideoDto } from './types';
// import type { UserSubscriptionRow, UserCourseOrderRow, UserAccessInfo } from '../repository/types';
// import { ACTIVE_SUBSCRIPTION_STATUSES } from '../repository/types';

// export class VirtuveService {
//     private virtuveRepository: VirtuveRepository;
//     private s3Service: S3Service;

//     constructor(virtuveRepository: VirtuveRepository, s3Service: S3Service) {
//         this.virtuveRepository = virtuveRepository;
//         this.s3Service = s3Service;
//     }
import { S3Service } from '../../../services/S3/S3Service';
import type { AdminVirtuveRepository } from './AdminVirtuveRepository';

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

	async deleteOneVideo(video_id: string, videoS3Key: string, imageS3Key: string) {
		await this.s3Service.deleteFile({
			Bucket: process.env.AWS_BUCKET_NAME!,
			Key: imageS3Key,
		});
		await this.s3Service.deleteFile({
			Bucket: process.env.AWS_BUCKET_NAME!,
			Key: videoS3Key,
		});
		await this.adminVirtuveRepository.deleteById(video_id);
	}
}
