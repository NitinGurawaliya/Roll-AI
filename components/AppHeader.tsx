import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buttonVariants } from "@/components/ui/button";

export function AppHeader({ name }: { name?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Logo href="/insight" />
        <div className="flex items-center gap-2">
          {name && (
            <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground md:inline">
              {name}
            </span>
          )}
          {/* Plain <a>, NOT next/link: this is an API route that 307s to /login
              after clearing the session cookie. next/link would intercept it as
              an RSC fetch and the redirect wouldn't drive a real navigation. */}
          <a
            href="/api/auth/logout"
            aria-label="Sign out"
            className={
              buttonVariants({ variant: "ghost", size: "sm" }) + " gap-1.5"
            }
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </a>
        </div>
      </div>
    </header>
  );
}
