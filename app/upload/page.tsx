import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ResumeUploader } from "@/components/ResumeUploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth";

export default async function UploadPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <AppHeader name={session.name} />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Upload your resume
          </h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;ll read it, detect your career persona, and surface the one
            opportunity that matters most.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>
              Your resume is analyzed to personalize everything that follows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResumeUploader />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
