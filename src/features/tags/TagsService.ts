import type { TagsRepository } from './TagsRepository';
import type { Feature, TagsResult } from './types';
import { AppError } from '../../common/errors/AppError';
import { allowFeatures } from './types';

export class TagsService {
	private tagsRepository: TagsRepository;

	constructor(tagsRepository: TagsRepository) {
		this.tagsRepository = tagsRepository;
	}

	async getAllTags(feature: Feature): Promise<TagsResult> {
		if (!allowFeatures.includes(feature)) {
			throw AppError.forbidden('Wrong feature');
		}
		return await this.tagsRepository.findTags(feature);
	}
}
