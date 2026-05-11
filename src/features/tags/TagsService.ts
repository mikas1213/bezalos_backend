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

	async addTag(feature: Feature, tag: string): Promise<void> {
		if (!allowFeatures.includes(feature) || feature === 'all') {
			throw AppError.badRequest('Wrong feature');
		}
		const trimmed = tag?.trim();
		if (!trimmed) throw AppError.badRequest('Tag is required');
		await this.tagsRepository.addTag(feature, trimmed);
	}

	async deleteTag(feature: Feature, tag: string): Promise<void> {
		if (!allowFeatures.includes(feature) || feature === 'all') {
			throw AppError.badRequest('Wrong feature');
		}
		if (!tag?.trim()) throw AppError.badRequest('Tag is required');
		await this.tagsRepository.deleteTag(feature, tag);
	}
}
