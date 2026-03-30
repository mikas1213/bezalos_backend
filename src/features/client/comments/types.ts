type ReplyRow = {
	id: string;
	userId: string;
	displayName: string;
	comment: string;
	createdAt: string;
};

export type CommentRow = ReplyRow & { replies: ReplyRow[] };
