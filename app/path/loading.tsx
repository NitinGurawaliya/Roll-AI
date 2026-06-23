import { AppHeader } from "@/components/AppHeader";
import { Stepper } from "@/components/Stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PathLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Stepper current="Plan" />
        <div className="mb-8 rounded-2xl border bg-gradient-to-br from-primary/8 to-transparent p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-9 w-72" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </div>
        <div className="grid gap-5">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Building your personalized plan…
        </p>
      </main>
    </div>
  );
}
