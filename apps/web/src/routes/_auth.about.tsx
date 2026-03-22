import { createFileRoute } from "@tanstack/react-router";
import { appConfig } from "@foundation/constants/app-config";

export const Route = createFileRoute("/_auth/about")({
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">About</h1>
      <p className="text-sm text-muted-foreground">{appConfig.description}</p>
      <p className="text-sm text-muted-foreground">Version {appConfig.version}</p>
    </div>
  );
}
