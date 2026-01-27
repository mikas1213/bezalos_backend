import { z } from 'zod';

export const UpdatePasswordSchema = z
	.object({
		password: z
			.string({ error: 'Neįvestas slaptažodis' })
			.min(8, 'Slaptažodis turi būti ne trumpesnis nei 8 simboliai')
			.regex(/[0-9]+/, 'Slaptažodį turi sudaryti bent vienas skaičius'),
		// .regex(/[A-Z]+/, 'Slaptažodį turi sudaryti bent viena didžioji raidė'),
		passwordConfirmed: z.string({ error: 'Pakartokite slaptažodį' }),
	})
	.refine((data) => data.password === data.passwordConfirmed, {
		error: 'Slaptažodis nesutampa',
		path: ['passwordConfirmed'],
	}).strict();

export type UpdatePasswordRequestDto = Omit<z.infer<typeof UpdatePasswordSchema>, 'passwordConfirmed'>;