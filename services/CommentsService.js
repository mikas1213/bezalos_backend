const { NotFoundError, ForbiddenError } = require('../utils/errors');

class CommentsServices {
    constructor(commentsRepository) {
        this.commentsRepository = commentsRepository;
    }

    async addNewComment(data) {
        return await this.commentsRepository.create(data);
    }

    async deleteComment(user_id, comment_id) {
        const comment = await this.commentsRepository.findById(comment_id);
        if (!comment) throw new NotFoundError('Comment not found');
        if (comment.user_id !== user_id) throw new ForbiddenError('Access denied');
        return await this.commentsRepository.deleteById(comment_id);
    }
}

module.exports = CommentsServices;