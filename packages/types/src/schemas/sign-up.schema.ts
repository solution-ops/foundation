import type { z } from "zod";
import { object, string } from "zod";

export const signUpSchema = object({
  username: string()
    .min(3, { message: "Username must contain between 3 and 20 characters" })
    .max(20, { message: "Username must contain between 3 and 20 characters" })
    .trim(),
  email: string().email().trim(),
  password: string()
    .min(8, { message: "Password must contain at least 8 characters." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
