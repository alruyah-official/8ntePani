import type { ReactNode } from "react";

/**
 * Auth layout — centers the login/signup card vertically and horizontally
 * within the flex-1 area between the global Navbar and Footer.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      {children}
    </div>
  );
}
