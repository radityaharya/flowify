import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon, DotIcon, InfoIcon } from "lucide-react";
import * as React from "react";
import { workflowRunStore } from "~/app/states/store";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

interface CardWithHeaderProps {
  children: React.ReactNode;
  id: string;
  title: string;
  type: string;
  status?: string;
  info?: string;
  className?: string;
}

const StatusBadge = React.memo(
  ({ operationStatus }: { operationStatus: string | undefined }) => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
      setIsVisible(true);
    }, []);

    const statusMapping = {
      completed: (
        <div className="flex flex-row gap-1 items-center">
          <CheckIcon className="w-4 h-4" />
          {"Completed"}
        </div>
      ),
      default: (
        <div className="flex flex-row gap-1 items-center">
          <LoadingSpinner className="w-4 h-4" />
          {"Pending"}
        </div>
      ),
    };

    return (
      <Badge
        variant={operationStatus === "completed" ? "outline" : "secondary"}
        className={cn(
          "text-sm space-x-2 bg-amber-500/40 border-2 border-amber-500 transition-all duration-500 ease-in-out transform",
          {
            "bg-green-500/40 border-2 border-green-500":
              operationStatus === "completed",
            "-translate-y-4": !isVisible,
            "translate-y-0": isVisible,
          },
        )}
      >
        {statusMapping[operationStatus as keyof typeof statusMapping] ||
          statusMapping.default}
      </Badge>
    );
  },
);

export function CardWithHeader({
  children,
  id,
  title,
  type,
  status,
  info,
  className,
}: CardWithHeaderProps) {
  const { workflowRun } = workflowRunStore((state) => ({
    workflowRun: state.workflowRun,
  }));

  const operationStatus = workflowRun?.operations?.find(
    (operation) => operation.id === id,
  )?.completedAt
    ? "completed"
    : undefined;

  const isRunning = workflowRun?.id;

  return (
    <div className="bg-transparent flex flex-col">
      <div className="flex flex-row">
        <div className="flex flex-col gap-2 h-10 py-1">
          {isRunning && (
            <StatusBadge
              key={operationStatus}
              operationStatus={operationStatus}
            />
          )}
        </div>
      </div>
      <Card
        className={cn(
          "flex w-[350px] flex-col gap-2 border dark:border-gray-600",
          className,
        )}
      >
        <div className="flex w-full flex-row gap-2 rounded-lg bg-accent p-2 justify-between">
          <div className="flex flex-row">
            <DotIcon
              size={24}
              className={cn("text-gray-500", {
                "text-red-400": status === "error",
                "text-green-400": status === "success",
                "text-gray-500": status === "loading",
              })}
            />
            <span className="font-medium text-sm">{title}</span>
          </div>
          <Badge>{type}</Badge>
        </div>
        {info && (
          <div className="flex flex-col gap-6 p-6 py-3">
            <div className="flex flex-row gap-2">
              <InfoIcon size={16} className="mt-[4px] min-w-4" />
              <p className="font-medium text-sm opacity-80">{info}</p>
            </div>
            <Separator />
          </div>
        )}
        <CardContent className={`${info ? "pt-0" : "pt-6"}`}>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
