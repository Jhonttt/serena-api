import {z} from 'zod';
import { calculateAge } from '../utils/age.js';

export const registerSchema = z.object({
  email: z.email({
    required_error: 'Email is required',
  }),
  password: z.string({
    required_error: 'Password is required',
  }).min(8, 'La contraseña debe tener al menos 8 caracteres'),
  first_name: z.string({
    required_error: 'First name is required',
  }).min(1, 'First name cannot be empty'),
  last_name: z.string({
    required_error: 'Last name is required',
  }).min(1, 'Last name cannot be empty'),
  birth_day: z.string({
    required_error: 'Birth date is required',
  }).refine((val) => {
    let age = calculateAge(val);
    return age >= 12;
  }, { message: 'La edad mínima es 12 años' }),
  education_level: z.string({
    required_error: 'Education level is required',
  }),
  full_name: z.string().optional(),
  phone: z.string().optional(),
  relationship: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email({
    required_error: 'Email is required',
  }),
  password: z.string({
    required_error: 'Password is required',
  })
})