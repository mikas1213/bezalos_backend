import { z } from 'zod';

export const VirtuveQuerySchema = z
	.object({
		c: z.string().optional(),
		f: z.string().optional(),
		s: z.string().optional(),
		page: z.coerce.number().int().min(1).optional().default(1),
		limit: z.coerce.number().int().min(1).max(50).optional().default(9),
	})
	.strict();

export type VirtuveQueryParams = z.infer<typeof VirtuveQuerySchema>;
