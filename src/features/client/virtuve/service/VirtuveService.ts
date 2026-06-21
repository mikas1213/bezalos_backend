import { VirtuveRepository } from '../repository/VirtuveRepository';
import { S3Service } from '../../../../services/S3/S3Service';
import { AppError } from '../../../../common/errors/AppError';
import type { VirtuveQueryParams } from '../schemas/VirtuveQuerySchema';
import type { VideosDto } from '../repository/types';
import type { VideoDto } from './types';
import type { UserSubscriptionRow, UserCourseOrderRow, UserAccessInfo } from '../repository/types';
import { ACTIVE_SUBSCRIPTION_STATUSES } from '../repository/types';

export class VirtuveService {
	private virtuveRepository: VirtuveRepository;
	private s3Service: S3Service;

	constructor(virtuveRepository: VirtuveRepository, s3Service: S3Service) {
		this.virtuveRepository = virtuveRepository;
		this.s3Service = s3Service;
	}

	async getAllVideos(params: VirtuveQueryParams): Promise<VideosDto> {
		return await this.virtuveRepository.findAll(params);
	}

	async getOneVideo(slug: string | string[], userId: string | undefined): Promise<VideoDto | null> {
		const video = await this.virtuveRepository.findById(userId, slug);
		if (!video) throw AppError.notFound('Video nerastas');

		const access = userId ? await this.getUserAccess(userId) : { hasSubscription: false, hasCourse: false };

		const canWatchFull = video.category === 'Nemokamas' || this.canAccessFullVideo(access, video.category === 'Kursai');

		const videoS3Key = canWatchFull ? video.video_s3_key : video.video_s3_snippet_key;
		const embedUrl = this.s3Service.generateSignedUrl(videoS3Key);
		const contentUrl = this.s3Service.getPublicUrl(video.video_s3_snippet_key);

		return {
			id: video.id,
			category: video.category,
			title: video.title,
			description: video.description,
			duration: video.duration,
			createdAt: video.created_at,
			isActive: video.is_active,
			slug: video.slug,
			viewsTotal: video.views_total,
			embedUrl,
			contentUrl,
			imageS3Key: video.image_s3_key,
			videoTags: video.video_tags,
			participants: video.participants,
			comments: video.comments,
			likesCount: video.likes_count,
			isLiked: video.is_liked,
			isSnippet: !canWatchFull,
			isCourseMaterial: video.category === 'Kursai',
		};
	}

	async updateOneVideoPlayCount(video_id: string, isSnippet: boolean): Promise<void> {
		await this.virtuveRepository.updateVideoPlayCount(video_id, isSnippet);
	}

	private async getUserAccess(userId: string) {
		const [subscription, courseOrder] = (await Promise.all([
			this.virtuveRepository.getUserSubscription(userId),
			this.virtuveRepository.getUserCourseAccess(userId),
		])) as [UserSubscriptionRow, UserCourseOrderRow | null];

		const hasSubscription =
			!!subscription &&
			ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status) &&
			new Date(subscription.expires) > new Date();

		const hasCourse = !!courseOrder?.is_course;
		return { hasSubscription, hasCourse };
	}

	private canAccessFullVideo(access: UserAccessInfo, isCourseMaterial: boolean): boolean {
		const { hasSubscription, hasCourse } = access;

		if (hasSubscription && hasCourse) return true;
		if (hasSubscription && !isCourseMaterial) return true;
		if (hasCourse && isCourseMaterial) return true;

		return false;
	}
}
