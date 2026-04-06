import { z } from 'zod';

export const VirtuveVideoViewsSchema = z
	.object({
		isSnippet: z.boolean(),
	})
	.strict();

export type VirtuveVideoViewsParams = z.infer<typeof VirtuveVideoViewsSchema>;
