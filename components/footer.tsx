import Link from "next/link";

/**
 * Footer — bottom section rendered on every page via the root layout.
 * Replace placeholder links and content as the app grows.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
        {/* Brand */}
        <p className="text-muted-foreground text-sm">
          &copy; {currentYear} MyApp. All rights reserved.
        </p>

        {/* Footer Links */}
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
