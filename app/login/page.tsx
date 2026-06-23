import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/upload");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Career Compass AI</CardTitle>
          <CardDescription>
            Sign in to get personalized, resume-driven career clarity.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
            >
              Sign-in failed. Please try again.
            </p>
          )}
          <Link
            href="/api/auth/google"
            className={buttonVariants({ size: "lg" }) + " w-full"}
          >
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
