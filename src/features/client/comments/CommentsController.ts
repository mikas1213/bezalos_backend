import type { CommentsService } from './CommentsService';
import { Request, Response } from 'express';
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {
		this.postComment = this.postComment.bind(this);
		this.deleteComment = this.deleteComment.bind(this);
		this.getComments = this.getComments.bind(this);
	}

	postComment = async (req: Request, res: Response) => {
		const { parentId, videoId, userId, comment } = req.body;

		await this.commentsService.postComment({ parentId, videoId, userId, comment });
		res.sendStatus(204);
	};

	deleteComment = async (req: Request, res: Response) => {
		const userId = req.user!.id;
		const commentId = String(req.params.id);
		await this.commentsService.deleteComment(userId, commentId);
		res.sendStatus(204);
	};

	getComments = async (req: Request, res: Response) => {
		const userId = req.user?.id;
		const videoId = String(req.params.videoId);
		const comments = await this.commentsService.getComments(videoId, userId);
		res.status(200).json(comments);
	};
}
