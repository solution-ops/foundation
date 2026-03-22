import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { queryClient } from "@foundation/ui/components/provider";
import { object, string } from "zod";
import { fetchCurrentUserQueryOptions } from "../api/auth/current-user";
import { AuthForm } from "../components/auth.form";
import { fallbackRoute, sanitizeRedirect } from "../hooks/use-auth-submit";

export const Route = createFileRoute("/sign-up")({
  validateSearch: object({
    redirect: string()
      .optional()
      .transform((val) => (sanitizeRedirect(val) === fallbackRoute ? "" : (val ?? "")))
      .catch(""),
  }),
  beforeLoad: async ({ search }) => {
    const session = await queryClient.fetchQuery(fetchCurrentUserQueryOptions());
    if (session) {
      throw redirect({ to: search.redirect || fallbackRoute });
    }
  },
  component: SignUp,
});

function SignUp() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Create a new account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/sign-in" className="font-medium underline text-primary hover:text-primary/90">
              Sign in
            </Link>
          </p>
        </div>
        <AuthForm type="sign-up" />
      </div>
    </div>
  );
}
