import { z } from 'zod';

export const CommentsSchema = z
	.object({
		videoId: z.uuid(),
		userId: z.uuid(),
		comment: z.string().min(1).max(1000).trim(),
		parentId: z.uuid().optional(),
	})
	.strict();

export type CommentsDto = z.infer<typeof CommentsSchema>;
