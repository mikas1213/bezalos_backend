import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().min(1, 'Neįvestas el. paštas'),
    password: z.string().min(1, 'Neįvestas slaptažodis'),
}).strict();

export type LoginRequestDto = z.infer<typeof LoginSchema>;

