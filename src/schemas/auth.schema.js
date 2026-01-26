import {z} from 'zod';

export const registerSchema = z.object({
  email: z.email({
    required_error: 'Email is required',
  }),
  password: z.string({
    required_error: 'Password is required',
  }).min(8, 'Password must be at least 8 characters long')
});

export const loginSchema = z.object({
  email: z.email({
    required_error: 'Email is required',
  }),
  password: z.string({
    required_error: 'Password is required',
  })
})