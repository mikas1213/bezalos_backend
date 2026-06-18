import type { LikesRepository } from './LikesRepository';
import { AppError } from '../../../common/errors/AppError';
import { LikesToggleDto } from './types';

export class LikesService {
	private likesRepository: LikesRepository;
	constructor(likesRepository: LikesRepository) {
		this.likesRepository = likesRepository;
	}

	async toggleLikes(userId: string | undefined, entityType: string, entity_id: string): Promise<LikesToggleDto> {
		const data = await this.likesRepository.findLike(userId, entity_id);
		if (data) {
			if (data.user_id !== userId) {
				throw AppError.forbidden('Access Denied');
			}
		}
		const result = await this.likesRepository.likesToggle(userId, entityType, entity_id);
		return {
			isLiked: result?.likes_toggle.isLiked,
			likesCount: result?.likes_toggle.likesCount,
		};
	}

	async getLikesCount(userId: string | undefined, entity_id: string): Promise<LikesToggleDto> {
		const [likesCount, like] = await Promise.all([
			this.likesRepository.getLikesCount(entity_id),
			userId ? this.likesRepository.findLike(userId, entity_id) : Promise.resolve(null),
		]);
		return { likesCount, isLiked: !!like };
	}
}
