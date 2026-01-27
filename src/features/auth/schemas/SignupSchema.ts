import { z } from 'zod';
const SUSPICIOUS_TLDS = ['cim', 'con', 'cpm', 'ocm', 'vom', 'gmal', 'gmial', 'yaho'];

export const SignupSchema = z
	.object({
		name: z.string().max(24, 'Vardas yra per ilgas'),
		email: z
			.string()
			.trim()
			.pipe(
				z.email({
					pattern: z.regexes.rfc5322Email,
					error: (iss) =>
						iss.input === undefined || iss.input === ''
							? 'Neįvestas el. paštas'
							: 'Neteisingai įvestas el. pašto adresas',
				}),
			)
			.refine(
				(email) => {
					const tld = email.split('@').pop()?.split('.').pop()?.toLowerCase() || '';
					return !SUSPICIOUS_TLDS.includes(tld);
				},
				{ message: 'Patikrink el. pašto adresą - galbūt įvedei klaidingą galūnę' },
			),
		password: z
			.string()
			.trim()
			.min(1, 'Neįvestas slaptažodis')
			.min(8, 'Slaptažodis turi būti ne trumpesnis nei 8 simboliai')
			.regex(/[0-9]/, 'Slaptažodį turi sudaryti bent vienas skaičius')
			.regex(/[a-zA-Z]/, 'Slaptažodį turi sudaryti bent viena raidė'),

		passwordConfirmed: z.string().trim().min(1, 'Pakartokite slaptažodį'),
		initialTarget: z.enum(['profilis', 'virtuve', 'abu', 'nezinau'], { error: 'Pasirink tikslą' }),
	})
	.refine((data) => data.password === data.passwordConfirmed, {
		message: 'Slaptažodis nesutampa',
		path: ['passwordConfirmed'],
	}).strict();

export type SignupRequestDto = Omit<z.infer<typeof SignupSchema>, 'passwordConfirmed'>;
