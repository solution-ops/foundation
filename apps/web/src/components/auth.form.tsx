import { signInSchema } from "@foundation/types/schemas/sign-in";
import { signUpSchema } from "@foundation/types/schemas/sign-up";
import { useAppForm } from "@foundation/ui/components/form";
import { SocialLoginButton } from "@foundation/ui/components/social-login-button";
import { cn } from "@foundation/ui/utils/cn";
import { useAuthSubmit } from "../hooks/use-auth-submit";

type AuthFormProps = {
  type: "sign-in" | "sign-up";
};

export function AuthForm({ type }: AuthFormProps) {
  const { handleEmailAuth, handleSocialAuth, isLoading } = useAuthSubmit(type);

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      ...(type === "sign-up" ? { username: "" } : {}),
    },
    validators: {
      onSubmit: type === "sign-up" ? signUpSchema : signInSchema,
    },
    onSubmit: async ({ value }) => {
      await handleEmailAuth(value as { email: string; password: string; username?: string });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.AppForm>
        <div className="space-y-3">
          {type === "sign-up" && (
            <form.AppField name="username">
              {({ TextField }) => <TextField label="Username" type="text" />}
            </form.AppField>
          )}
          <form.AppField name="email">{({ TextField }) => <TextField label="Email" type="email" />}</form.AppField>
          <form.AppField name="password">
            {({ TextField }) => (
              <TextField
                label="Password"
                type="password"
                {...(type === "sign-in" && { description: "Enter your password" })}
              />
            )}
          </form.AppField>
          <form.SubmitButton
            label={type === "sign-up" ? "Sign up" : "Sign in"}
            className="w-full"
            disabled={isLoading}
          />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className={cn("w-full gap-2 flex items-center", "justify-between flex-col")}>
            <SocialLoginButton provider="google" loading={isLoading} onClick={() => handleSocialAuth("google")} />
          </div>
        </div>
      </form.AppForm>
    </form>
  );
}
