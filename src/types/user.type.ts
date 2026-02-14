import z from 'zod';

export const UserSchema = z.object({
    // username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(1),
    isInfluencer: z.boolean().default(false),
    role: z.enum(['admin', 'user']).default('user'),
});

export type UserType = z.infer<typeof UserSchema>;
