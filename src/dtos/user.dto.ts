import z from 'zod';

export const CreateUserDTO = z
    .object({
        email: z.string().email(),
        password: z.string().min(6),
        confirmPassword: z.string().min(6).optional(),
        fullName: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        isInfluencer: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        if (!data.fullName && !data.name) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Either fullName or name is required',
                path: ['fullName'],
            });
        }
        if (data.confirmPassword && data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Passwords do not match',
                path: ['confirmPassword'],
            });
        }
    })
    .transform((data) => ({
        ...data,
        fullName: data.fullName ?? data.name!,
    }));

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().min(3),
    password: z.string().min(6),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
