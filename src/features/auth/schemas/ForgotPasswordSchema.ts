import { z } from 'zod';

export const ForgotPasswordSchema = z
	.object({
		email: z
			.string()
			.trim()
			.pipe(
				z.email({
					error: (iss) => (!iss.input ? 'Neįvestas el. paštas' : 'Neteisingai įvestas el. pašto adresas'),
				}),
			),
	})
	.strict();

export type ForgotPasswordRequestDto = z.infer<typeof ForgotPasswordSchema>;
