import type { z } from "zod";
import { email, object } from "zod";

import { signUpSchema } from "./sign-up.schema";

export const signInSchema = object({
  email: email().trim(),
  password: signUpSchema.shape.password,
});
export type SignInSchema = z.infer<typeof signInSchema>;
