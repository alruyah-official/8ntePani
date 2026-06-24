import Link from "next/link";

/**
 * Navbar — top navigation bar rendered on every page via the root layout.
 * Replace placeholder links with real navigation items as the app grows.
 */
export function Navbar() {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo / Brand */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          MyApp
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="/pricing"
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
        </nav>

        {/* CTA Placeholder */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
