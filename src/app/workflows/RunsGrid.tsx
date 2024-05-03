"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

function relativeDate(date: number) {
  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) {
    return "Invalid date";
  }
  const relativeDate = formatDistanceToNow(dateObj, { addSuffix: true });
  const formattedDate = dateObj.toLocaleString();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span>{relativeDate}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{formattedDate}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface PlaylistCardProps {
  source: {
    id: string;
    params: {
      image: string;
      name: string;
      owner: string;
    };
  };
}

const RunCard = ({ d }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{d.workflow.name}</CardTitle>
        <CardDescription className="text-balance"></CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="text-muted-foreground text-sm flex flex-col gap-2 items-start"></CardFooter>
    </Card>
  );
};

const CardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <Skeleton className="w-32 h-4" />
        </CardTitle>
        <CardDescription className="text-balance">
          <Skeleton className="w-24 h-3" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-32 h-4" />
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm flex flex-col gap-2 items-start">
        <Skeleton className="w-32 h-3" />
        <Skeleton className="w-32 h-3" />
      </CardFooter>
    </Card>
  );
};

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = {
      status: res.status,
      info: "An error occurred while fetching the data.",
    };
    const json = await res.json();
    error.info = json.error;
    console.info(error);
    throw error;
  }

  const data = (await res.json()) as Workflow.WorkflowResponse[];
  // return data.map((workflow) => {
  //   return {
  //     id: workflow.id,
  //     workflow: workflow.workflow,
  //     createdAt: workflow.createdAt,
  //     lastRunAt: workflow.lastRunAt,
  //     modifiedAt: workflow.modifiedAt,
  //     cron: workflow.cron,
  //     runs: workflow.runs,
  //   };
  // });

  // flatten runs runs with workflow.
  const runs = data.flatMap((workflow) => {
    return workflow.runs?.map((run) => {
      return {
        id: run.id,
        runAt: run.startedAt,
        workflow: workflow.workflow,
        error: run.error,
        completedAt: run.completedAt,
      };
    });
  });

  return runs;
};

export function RunsGrid() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    error,
    isLoading: isSWRLoading,
    mutate,
  } = useSWR<any[] | undefined>(`/api/user/@me/workflows`, fetcher);

  const isLoading = isSWRLoading || isRefreshing;

  const refreshData = async () => {
    setIsRefreshing(true);
    await mutate();
    setIsRefreshing(false);
  };

  return (
    <>
      <div className="pt-2">
        <div className="pb-1 flex flex-row items-center justify-between">
          <h1 className="text-xl font-medium leading-9 tracking-tight">
            Latest Runs
          </h1>
        </div>
        <div className="py-3">
          <div className="grid grid-cols-1 gap-4">
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)
              : data?.map((d) => <RunCard key={d.id} d={d} />)}
          </div>
        </div>
      </div>
    </>
  );
}
