import { redirect } from "next/navigation";
import { RunsGrid } from "./RunsGrid";
import { WorkflowsGrid } from "./WorkflowGrid";
import { auth } from "~/server/auth";
export default async function Dashboard() {
  const workflows = undefined;

  const session = await auth();

  if (!session?.user) {
    return redirect("/auth/login");
  }

  return (
    <div className="flex w-full flex-col min-h-screen">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="gap-4 p-4 md:gap-8 sm:px-6 sm:py-0">
          <div className="items-start w-full flex flex-col-reverse xl:flex-row gap-4 md:gap-8">
            <RunsGrid />
            <WorkflowsGrid workflows={workflows} />
          </div>
        </main>
      </div>
    </div>
  );
}
