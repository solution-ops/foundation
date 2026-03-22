export const appConfig = {
  name: "Foundation",
  version: "0.1.0",
  tagline: "Get things done. Stay in control.",
  description:
    "A production-ready full-stack foundation. Auth, database, API, and UI — wired together and ready to build on.",
  mainNav: [],
  links: {
    github: "https://github.com/solution-ops/foundation",
    docs: "https://foundation.solutionops.com",
  },
} as const;

export type AppConfig = typeof appConfig;
