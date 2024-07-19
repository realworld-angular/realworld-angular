import { z } from "zod";

export const userRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(({password, confirmPassword}) => password === confirmPassword, {
    message: 'Passwords do not match',
});
