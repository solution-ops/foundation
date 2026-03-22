import type { Session } from "@foundation/db/schemas/sessions";
import type { User } from "@foundation/db/schemas/users";

export type CurrentUserSession = {
  user: Pick<User, "id" | "email" | "name" | "image" | "lastLogin" | "emailVerified">;
  session: Pick<Session, "id" | "expiresAt" | "token">;
};
