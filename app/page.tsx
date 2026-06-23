import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  FileText,
  Compass,
  Sparkles,
  Map as MapIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { getSession } from "@/lib/auth";

const STEPS = [
  {
    icon: FileText,
    title: "Upload your resume",
    body: "We read it and detect your career persona in seconds.",
  },
  {
    icon: Compass,
    title: "See the real opportunity",
    body: "One sharp, specific tension worth acting on — not generic advice.",
  },
  {
    icon: Sparkles,
    title: "Get matched paths",
    body: "Three personalized directions, scored against your experience.",
  },
  {
    icon: MapIcon,
    title: "Follow a 90-day plan",
    body: "Pick one path and get a focused, actionable roadmap.",
  },
];

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/upload");

  return (
    <div className="aurora min-h-screen">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Logo href="/" />
        <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <section className="flex flex-col items-center py-20 text-center sm:py-28">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            AI career coach for your next move
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Find your next career move with{" "}
            <span className="text-gradient">real clarity</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Career Compass reads your resume, names the opportunity that matters,
            and turns it into personalized paths backed by a 90-day plan.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className={buttonVariants({ size: "lg" }) + " gap-2"}
            >
              Get started — it&apos;s free
              <ArrowRight className="size-4" />
            </Link>
            <span className="text-xs text-muted-foreground">
              Sign in with Google · we only store your name and email
            </span>
          </div>
        </section>

        <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border bg-card/60 p-5 backdrop-blur-sm"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-5" />
              </div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Step {i + 1}
              </p>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
