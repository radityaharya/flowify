import { WorkflowTable } from "./WorkflowTable";

export default function Dashboard() {
  const workflows = undefined;

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="gap-4 p-4 md:gap-8 sm:px-6 sm:py-0">
          <div className="items-start gap-4 md:gap-8">
            <WorkflowTable workflows={workflows} />
          </div>
        </main>
      </div>
    </div>
  );
}
