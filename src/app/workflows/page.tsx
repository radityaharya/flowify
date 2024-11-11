import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

import { RunsGrid } from "./RunsGrid";
import { WorkflowsGrid } from "./WorkflowGrid";
export default async function Dashboard() {
  const workflows = undefined;

  const session = await auth();

  if (!session?.user) {
    return redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="flex w-full flex-col-reverse items-start gap-4 md:gap-8 xl:flex-row">
            <RunsGrid />
            <WorkflowsGrid workflows={workflows} />
          </div>
        </main>
      </div>
    </div>
  );
}
