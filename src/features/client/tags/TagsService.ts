import type { TagsRepository } from './TagsRepository';
import type { Feature, TagsFilterResult } from './types';

export class TagsService {
	private tagsRepository: TagsRepository;

	constructor(tagsRepository: TagsRepository) {
		this.tagsRepository = tagsRepository;
	}

	async getFilters(feature: Feature): Promise<TagsFilterResult> {
		return await this.tagsRepository.findCategories(feature);
	}
}
