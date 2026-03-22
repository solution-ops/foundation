import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type PropsWithChildren, Suspense } from "react";
import { toast } from "sonner";

import { queryConfig } from "../lib/react-query";
import { Toaster } from "./sonner";
import { ThemeProvider } from "./theme-provider";

const mutationCache = new MutationCache({
  onSuccess: (_data, _variables, _context, mutation) => {
    const message = mutation.meta?.successMessage;
    if (message) {
      toast.success(message);
    }
  },
  onError: (error, _variables, _context, mutation) => {
    toast.error(mutation.meta?.errorMessage ?? "Something went wrong", {
      description: error.message,
    });
  },
});

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
  mutationCache,
});

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="foundation-theme">
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        }
      >
        <QueryClientProvider client={queryClient}>
          {import.meta.env.DEV && <ReactQueryDevtools />}
          {children}
          <Toaster />
        </QueryClientProvider>
      </Suspense>
    </ThemeProvider>
  );
}
