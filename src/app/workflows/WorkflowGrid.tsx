"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpDown,
  Calendar,
  ChevronsUpDown,
  Clock,
  MoreVertical,
  PenBox,
  Trash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { runWorkflow } from "../utils/runWorkflow";

function getTargets(
  operations: Workflow.WorkflowResponse["workflow"]["operations"],
) {
  const targets = operations.filter((operation) => {
    return !operations.some((otherOperation) => {
      return (
        otherOperation.sources?.includes(operation.id) &&
        otherOperation.id !== operation.id
      );
    });
  });

  targets.forEach((target: any) => {
    if (!target.params.name) {
      target.params.name = "New playlist";
      target.params.owner = "New playlist";
      target.params.image =
        "https://misc.scdn.co/liked-songs/liked-songs-300.png";
    }
  });

  return targets;
}

function getSources(
  operations: Workflow.WorkflowResponse["workflow"]["operations"],
) {
  const sources = operations.filter((operation) => {
    return !operation.sources || operation.sources.length === 0;
  });

  sources.forEach((source: any) => {
    if (!source.params.name) {
      source.params.name = "New playlist";
      source.params.owner = "New playlist";
      source.params.image =
        "https://misc.scdn.co/liked-songs/liked-songs-300.png";
    }
  });

  return sources;
}

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
      playlistId: string;
    };
  };
}

function PlaylistCard({ source }: PlaylistCardProps) {
  return (
    <Card className="flex items-center gap-2 p-2" key={source.id}>
      <Image
        className="h-8 w-8 rounded-sm"
        src={source.params.image}
        alt=""
        width={32}
        height={32}
        unoptimized
      />
      <div className="flex w-full flex-col items-start">
        <Link
          className="max-w-[160px] overflow-hidden overflow-ellipsis whitespace-nowrap font-medium text-sm"
          href={
            ["likedTracks", "recommended"].includes(source.params.playlistId)
              ? "#"
              : `https://open.spotify.com/playlist/${source.params.playlistId}`
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          {source.params.name}
        </Link>
        <div className="text-xs opacity-80">
          {`Playlist • ${source.params.owner}`}
        </div>
      </div>
    </Card>
  );
}

function PlaylistCardSkeleton() {
  return (
    <Card className="flex items-center gap-2 p-2">
      <Skeleton className="h-8 w-8 rounded-sm" />
      <div className="flex w-full flex-col items-start gap-1">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
    </Card>
  );
}

function PlaylistCardTrigger({ source, setIsOpen }) {
  return (
    <Card className="flex items-center gap-2 p-2" key={source.id}>
      <Image
        className="h-8 w-8 rounded-sm"
        src={source.params.image}
        alt=""
        width={32}
        height={32}
        unoptimized
      />
      <div className="flex w-full flex-col items-start">
        <div className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap font-medium text-sm">
          {source.params.name}
        </div>
        <div className="text-xs opacity-80">
          {`Playlist • ${source.params.owner}`}
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={() => setIsOpen((prev) => !prev)}
        size={"sm"}
      >
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    </Card>
  );
}

const ColapsiblePlaylists = ({ sources }: { sources: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (sources.length === 1) {
    return <PlaylistCard source={sources[0]} />;
  } else {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
        <CollapsibleTrigger asChild>
          <PlaylistCardTrigger
            source={{
              id: sources[0].id,
              params: {
                image: sources[0].params.image,
                name: `${sources[0].params.name} + ${sources.length - 1} more`,
                owner: `${sources[0].params.owner} + ${
                  sources.length - 1
                } more`,
              },
            }}
            setIsOpen={setIsOpen}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 CollapsibleContent">
          {sources.map((source, _index) => (
            <PlaylistCard source={source} key={source.id} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }
};

const CardSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">
        <Skeleton className="h-5 w-40" />
      </CardTitle>
      <Skeleton className="h-4 w-44" />
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex flex-col gap-2">
            <PlaylistCardSkeleton />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex flex-col gap-2">
            <PlaylistCardSkeleton />
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="text-muted-foreground text-sm flex flex-col gap-2 items-start">
      <div className="flex flex-row gap-2">
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
    </CardFooter>
  </Card>
);

const WorkflowCardDropdownMenu = ({ id }) => {
  const onDelete = () => {
    const deletePromise = fetch(`/api/workflow/${id}/delete`, {
      method: "POST",
    });
    toast.promise(deletePromise, {
      loading: "Deleting workflow...",
      success: (_data) => {
        mutate(`/api/user/@me/workflows`, undefined, { revalidate: true });
        return "Workflow deleted.";
      },
      error: "Failed to delete workflow.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="px-2">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="right">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/workflow/${id}`}>
            <PenBox className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="bg-red-600 focus:bg-red-500"
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const WorkflowCard = ({ d }) => {
  const name = d.workflow.name;
  const id = d.id;

  const handleRunClick = (event: React.MouseEvent) => {
    runWorkflow(d.workflow);
    mutate(`/api/user/@me/workflows`);
  };

  return (
    <Card className="relative hover:border-white">
      <CardHeader className="flex flex-row justify-between w-full">
        <div>
          <CardTitle className="text-base">{d.workflow.name}</CardTitle>
          <CardDescription className="text-balance space-y-2">
            <div>{d.workflow.description || "No description"}</div>
            <div className="space-x-2">
              <Badge
                className="text-xs font-normal items-center gap-1 text-muted-foreground"
                variant={"outline"}
              >
                <ArrowUpDown className="h-3 w-3" />
                <span>{d.workflow.operations.length} operations</span>
              </Badge>
              {d.averageRunTime !== 0 && !Number.isNaN(d.averageRunTime) && (
                <Badge
                  className="text-xs font-normal items-center gap-1 text-muted-foreground"
                  variant={"outline"}
                >
                  <Clock className="h-3 w-3" />
                  <span>{(d.averageRunTime / 1000).toFixed(2)}s</span>
                </Badge>
              )}
            </div>
          </CardDescription>
        </div>
        <div className="flex flex-row gap-1 z-[3]">
          <Button variant="outline" onClick={handleRunClick}>
            {"Run"}
          </Button>
          <WorkflowCardDropdownMenu id={id} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 z-[3]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sources</span>
              <span className="text-xs opacity-80">
                {d.workflow.sources.length}
              </span>
            </div>
            <ColapsiblePlaylists sources={d.workflow.sources} />
          </div>
          <div className="flex flex-col gap-1 z-[3]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Targets</span>
              <span className="text-xs opacity-80">
                {d.workflow.targets.length}
              </span>
            </div>
            <ColapsiblePlaylists sources={d.workflow.targets} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm flex flex-col xl:flex-row gap-2 items-start xl:items-center">
        {/* <div className="flex text-xs items-center gap-1">
          <ArrowUpDown className="h-4 w-4" />
          <span>{d.workflow.operations.length} operations</span>
        </div> */}
        <div className="flex text-xs flex-row gap-2 flex-wrap">
          <Calendar className="h-4 w-4" />
          <div className="flex items-center gap-1">
            created
            <span className="z-[3]">{relativeDate(d.createdAt)}</span>
          </div>
          {"|"}
          <div className="flex items-center gap-1">
            last run
            <span className="z-[3]">
              {d.lastRunAt ? relativeDate(d.lastRunAt) : "N/A"}
            </span>
          </div>
        </div>
      </CardFooter>
      <Link
        href={`/workflow/${name.toLowerCase().replace(" ", "-")}_${id}`}
        className="absolute inset-0"
        aria-hidden="true"
      />
    </Card>
  );
};

const EmptyWorkflowCard = () => (
  <Card className="flex flex-col items-center justify-center col-span-2 py-32 w-full">
    <h1 className="text-xl font-base text-muted-foreground">
      You have no workflows!
    </h1>
    <Link href="/workflow" className="mt-4">
      <Button variant="outline">Create Workflow</Button>
    </Link>
  </Card>
);

const RunCardSkeleton = () => (
  <Card className="w-full xl:w-[300px]">
    <CardHeader className="pb-2">
      <CardTitle>
        <Skeleton className="h-5 w-20" />
      </CardTitle>
    </CardHeader>
    <CardContent className="flex flex-row gap-1 pb-2">
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-4 w-20" />
    </CardContent>
    <CardFooter className="flex flex-row gap-1">
      <Skeleton className="h-4 w-24" />
    </CardFooter>
  </Card>
);

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
  return data.map((workflow) => {
    const runs = workflow.runs || [];
    const runTimes = runs.map(
      (run) =>
        new Date(run.completedAt!).getTime() -
        new Date(run.startedAt).getTime(),
    );
    let averageRunTime =
      runTimes.reduce((a, b) => a + b, 0) / (runTimes.length || 1) || 0;

    if (averageRunTime <= 0) {
      averageRunTime = NaN;
    }

    return {
      id: workflow.id,
      workflow: {
        ...workflow.workflow,
        id: workflow.id,
        sources: getSources(workflow.workflow.operations),
        targets: getTargets(workflow.workflow.operations),
      },
      createdAt: workflow.createdAt,
      lastRunAt: workflow.lastRunAt,
      modifiedAt: workflow.modifiedAt,
      cron: workflow.cron,
      runs: runs,
      averageRunTime,
    };
  });
};

type WorkflowTableProps = {
  workflows?: {
    id: string;
    workflow: Workflow.WorkflowResponse["workflow"] & {
      sources: any[];
      targets: any[];
    };
    createdAt: number;
    lastRunAt: number;
    modifiedAt: number;
    cron: string;
    averageRunTime: number | undefined;
  }[];
};

export function WorkflowsGrid({ workflows }: WorkflowTableProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    error,
    isLoading: isSWRLoading,
    mutate,
  } = useSWR<Workflow.WorkflowResponse[] | undefined>(
    `/api/user/@me/workflows`,
    fetcher,
  );

  const isLoading = isSWRLoading || isRefreshing;

  const runs = data
    ?.flatMap((workflow) => {
      return workflow.runs?.map((run) => {
        return {
          id: run.id,
          startedAt: run.startedAt,
          workflow: workflow,
          error: run.error,
          completedAt: run.completedAt,
        };
      });
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b!.startedAt).getTime() - new Date(a!.startedAt).getTime(),
    )
    .slice(0, 4);

  return (
    <div className="pt-2 w-full">
      <div id="workflows" className="flex-grow">
        <div className="pb-1 flex flex-row items-center justify-between">
          <h1 className="text-xl font-medium leading-9 tracking-tight">
            Your Workflows
          </h1>
          <Link
            className={buttonVariants({ variant: "default", size: "sm" })}
            href="/workflow"
          >
            Create Workflow
          </Link>
        </div>
        <div className="py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)
            ) : data && data.length > 0 ? (
              data.map((d) => <WorkflowCard key={d.id} d={d} />)
            ) : (
              <EmptyWorkflowCard />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
