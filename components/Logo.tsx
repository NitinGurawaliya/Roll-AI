import Link from "next/link";
import { Compass } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Compass className="size-4" />
      </span>
      <span>
        Career Compass<span className="text-muted-foreground"> AI</span>
      </span>
    </Link>
  );
}
