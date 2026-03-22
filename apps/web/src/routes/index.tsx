import type { Icon } from "@phosphor-icons/react";
import {
  GlobeIcon,
  KeyboardIcon,
  LockIcon,
  PaletteIcon,
  StackIcon,
  WrenchIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { appConfig } from "@foundation/constants/app-config";
import { Button } from "@foundation/ui/components/button";
import { ThemeToggle } from "@foundation/ui/components/theme-toggle";
import { LogoIcon } from "@foundation/ui/icons/logo";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

// ── Navigation ──────────────────────────────────────────────

function Navigation() {
  return (
    <header className="py-6">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon className="size-6" />
            <span className="text-sm font-bold text-foreground">{appConfig.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/sign-in" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Button size="sm" render={<Link to="/sign-up" />}>
              Get started
            </Button>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

// ── Hero ────────────────────────────────────────────────────

function SwashUnderline({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 418 42" className={className} preserveAspectRatio="none">
      <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
    </svg>
  );
}

function HeroSection() {
  return (
    <section className="pt-14 lg:pt-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Build faster.
            <br />
            <span className="relative whitespace-nowrap text-primary">
              <SwashUnderline className="absolute top-2/3 left-0 h-[0.58em] w-full fill-primary/30" />
              <span className="relative">Ship sooner.</span>
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{appConfig.description}</p>
          <div className="mt-6 flex gap-3">
            <Button size="lg" render={<Link to="/sign-up" />}>
              Get started
            </Button>
            <Button variant="outline" size="lg" render={<Link to="/sign-in" />}>
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Features ────────────────────────────────────────────────

const features: Array<{ icon: Icon; title: string; description: string }> = [
  {
    icon: LockIcon,
    title: "Auth built in",
    description: "Email/password and Google OAuth, session management, and account deletion. Ready from clone.",
  },
  {
    icon: StackIcon,
    title: "Full-stack monorepo",
    description: "API, web, database, shared types, and UI components. One repo, everything connected.",
  },
  {
    icon: WrenchIcon,
    title: "CRUD + audit log",
    description: "Example resource with create, read, update, soft-delete, and automatic activity tracking.",
  },
  {
    icon: PaletteIcon,
    title: "Dark mode + theming",
    description: "Light and dark themes with system detection. shadcn/ui components styled and ready.",
  },
  {
    icon: KeyboardIcon,
    title: "Keyboard-first",
    description: "Command palette, shortcuts, and quick actions. Bottom tab bar and FAB for mobile.",
  },
  {
    icon: GlobeIcon,
    title: "Open source",
    description: "AGPL licensed. Clone it, customize it, ship your own product on top of it.",
  },
];

function FeaturesSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title}>
              <feature.icon className="size-5 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ─────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Start building</h2>
        <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
          Clone the repo. Change the config. Ship your product.
        </p>
        <div className="mt-8">
          <Button size="lg" render={<Link to="/sign-up" />}>
            Get started
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-8 sm:px-6">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {appConfig.name}
        </p>
        <div className="flex items-center gap-4">
          <a
            href={appConfig.links.github}
            className="text-sm text-muted-foreground hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
