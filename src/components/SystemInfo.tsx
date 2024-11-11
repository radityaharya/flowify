import Link from "next/link";
import useSWR from "swr";

import { fetcher } from "@/app/utils/fetcher";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function SystemInfo() {
  const { data, isLoading: workerLoading } = useSWR<Workflow.SystemInfo>(
    "/api/systeminfo",
    fetcher,
  );

  const workers = data?.workers || [];
  const systemStatus = data?.systemStatus;

  let status = "unknown";
  let message = "";

  if (typeof systemStatus === "object" && systemStatus !== null) {
    status = systemStatus.status || "unknown";
    message = systemStatus.message || "";
  }

  if (workers.length === 0 && status !== "error") {
    status = "degraded";
    message = `${message} - Jobs may not be processed immediately`;
  }

  return (
    <>
      {!workerLoading && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="https://status.radityaharya.com/status/flowify"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-8 text-sm font-normal text-white",
                )}
                target="_blank"
              >
                <span
                  className={cn(
                    "inline-block size-2 animate-pulse rounded-full",
                    status === "ok"
                      ? "bg-green-500"
                      : status === "degraded"
                        ? "bg-yellow-500"
                        : "bg-red-500",
                  )}
                ></span>
                {status === "ok" ? (
                  <span className="ml-2">System is operational</span>
                ) : (
                  <span className="ml-2">System is {status}</span>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side={"left"} className="flex flex-col gap-2">
              <div>{message}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}
