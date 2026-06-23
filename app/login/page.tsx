import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { getSession } from "@/lib/auth";
import { resolveFurthestStep } from "@/lib/progress";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.35 11.1h-9.17v2.92h5.27c-.23 1.4-1.62 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.86s2.59-5.86 5.76-5.86c1.81 0 3.02.77 3.71 1.43l2.53-2.44C17.06 3.27 14.86 2.3 12.18 2.3 7.06 2.3 2.9 6.45 2.9 11.6s4.16 9.3 9.28 9.3c5.36 0 8.9-3.77 8.9-9.07 0-.61-.07-1.07-.18-1.53z"
      />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(await resolveFurthestStep(session.userId));

  const { error } = await searchParams;

  return (
    <main className="aurora flex min-h-screen flex-col items-center justify-center p-6">
      <div className="mb-8">
        <Logo href="/" />
      </div>
      <Card className="w-full max-w-md border-border/60 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to get personalized, resume-driven career clarity.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              {error === "session"
                ? "Your session expired. Please sign in again."
                : "Sign-in failed. Please try again."}
            </p>
          )}
          <Link
            href="/api/auth/google"
            className={buttonVariants({ size: "lg" }) + " w-full gap-2"}
          >
            <GoogleIcon />
            Continue with Google
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            We only store your name and email.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
