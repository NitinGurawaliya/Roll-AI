import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function AppHeader({ name }: { name?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/upload" className="font-semibold tracking-tight">
          Career Compass<span className="text-muted-foreground"> AI</span>
        </Link>
        <div className="flex items-center gap-3">
          {name && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {name}
            </span>
          )}
          <Link
            href="/api/auth/logout"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Sign out
          </Link>
        </div>
      </div>
    </header>
  );
}
