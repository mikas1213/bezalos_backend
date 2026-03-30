import type { CommentsRepository } from './CommentsRepository';
import type { CommentRow } from './types';
import type { CommentsDto } from './CommentsSchema';
import { AppError } from '../../../common/errors/AppError';

export class CommentsService {
	constructor(private readonly commentsRepository: CommentsRepository) {}

	async postComment(data: CommentsDto): Promise<void> {
		return await this.commentsRepository.createComment(data);
	}

	async deleteComment(userId: string, commentId: string): Promise<void> {
		const comment = await this.commentsRepository.findById(commentId);
		if (!comment) throw AppError.notFound('Comment not found');
		if (comment.userId !== userId) throw AppError.forbidden('Access denied');
		return await this.commentsRepository.deleteById(commentId);
	}

	async getComments(videoId: string, userId: string | undefined): Promise<CommentRow[]> {
		return await this.commentsRepository.getComments(videoId, userId);
	}
}
