import type { CreateUser } from "@foundation/types/auth/create-user";
import type { SignUpSchema } from "@foundation/types/schemas/sign-up";
import { api } from "@foundation/ui/lib/api-client";
import { ensureError } from "@foundation/utils/common/ensure-error";

export async function signUp(data: SignUpSchema) {
  try {
    const response = await api.post<CreateUser>("/auth/sign-up", data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response;
  } catch (error) {
    throw ensureError(error);
  }
}
