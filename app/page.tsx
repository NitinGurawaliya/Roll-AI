import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/upload");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-4 inline-block rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          AI Career Coach
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Find your next career move with clarity.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Career Compass AI reads your resume, detects your career persona,
          surfaces the opportunity that matters, and recommends personalized
          paths — backed by a focused 90-day plan.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Get started
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Upload your resume
          </Link>
        </div>
      </div>
    </main>
  );
}
