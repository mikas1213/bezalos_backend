const { ForbiddenError } = require('../utils/errors');

class LikesService {
	constructor(likesRepository) {
		this.likesRepository = likesRepository;
	}

	async toggleLikes(user_id, category, entity_id) {
		const data = await this.likesRepository.findLike(user_id, entity_id);
		if (data.length > 0) {
			if (data[0].user_id !== user_id) {
				throw new ForbiddenError('Access Denied');
			}
		}
		return await this.likesRepository.likesToggle(user_id, category, entity_id);
	}
}

module.exports = LikesService;
