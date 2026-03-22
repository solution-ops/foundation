import type { User } from "@foundation/db/schemas/users";

export type CreateUser = Pick<User, "id" | "email" | "name" | "emailVerified" | "image">;
