"use client";
import { fetcher } from "@/app/utils/fetcher";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown, ChevronsUpDown, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type WorkflowsTableColumn = {
  name: string;
  sources: string;
  target: string;
  createdAt: string;
  lastRunAt: string;
  modifiedAt: string;
  cron: string;
};

function getTargets(operations: WorkflowResponse["workflow"]["operations"]) {
  const targets = operations.filter((operation) => {
    return operation.type.startsWith("Library.saveAs"); //TODO: Find a better way to filter
  });

  return targets;
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
        <div className="max-w-[160px] overflow-hidden overflow-ellipsis whitespace-nowrap font-medium text-sm">
          {source.params.name}
        </div>
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

function ColapsiblePlaylists({ sources }: { sources: any[] }) {
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
            <PlaylistCard source={source} key={source.id}/>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }
}

const columns: ColumnDef<WorkflowsTableColumn>[] = [
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "workflow.name",
    cell: ({ row, getValue }) => {
      const name = getValue() as WorkflowResponse["workflow"]["name"];
      const id = (row.original as any).id;
      return (
        <div className="font-medium">
          <Link href={`/workflow/${name.toLowerCase().replace(" ","-")}_${id}`}>{name}</Link>
        </div>
      );
    },
  },
  {
    accessorKey: "workflow.sources",
    header: "Sources",
    cell: ({ row, getValue }) => {
      const sources = getValue() as WorkflowResponse["workflow"]["sources"];
      return <ColapsiblePlaylists sources={sources} />;
    },
    meta: {
      type: "playlist",
    },
  },
  {
    accessorKey: "workflow.operations",
    header: "Targets", //TODO: temp
    cell: ({ row, getValue }) => {
      const operations =
        getValue() as WorkflowResponse["workflow"]["operations"];
      const targets = getTargets(operations);
      return <ColapsiblePlaylists sources={targets} />;
    },
    meta: {
      type: "playlist",
    },
  },
  {
    header: "Created",
    accessorKey: "createdAt",
    cell: ({ row, getValue }) => {
      const createdAt = getValue() as WorkflowResponse["createdAt"];
      return relativeDate(createdAt!);
    },
  },
  {
    header: "Last Run",
    accessorKey: "lastRunAt",
    cell: ({ row, getValue }) => {
      const lastRunAt = getValue() as WorkflowResponse["lastRunAt"];
      return lastRunAt ? relativeDate(lastRunAt) : "Never";
    },
  },
  {
    header: "Modified",
    accessorKey: "modifiedAt",
    cell: ({ row, getValue }) => {
      const modifiedAt = getValue() as WorkflowResponse["modifiedAt"];
      return modifiedAt ? relativeDate(modifiedAt) : "N/A";
    },
  },
  {
    header: "Cron",
    accessorKey: "cron",
  },
];

type CustomColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  meta?: any;
};

interface DataTableProps<TData, TValue> {
  columns: CustomColumnDef<TData, TValue>[];
  data?: TData[];
}

function DataTable<TData, TValue>({
  columns,
  data = [],
  isLoading,
}: DataTableProps<TData, TValue> & { isLoading: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });
  const _router = useRouter();

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          [...Array(5)].map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <TableRow key={index}>
              {columns.map((column, columnIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <TableCell key={columnIndex}>
                  {column.meta?.type === "playlist" ? (
                    <PlaylistCardSkeleton />
                  ) : (
                    <Skeleton className="h-[20px] w-[100px] rounded-full" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              You have no workflows! Create one by clicking the button above.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

type WorkflowTableProps = {
  workflows?: WorkflowResponse[];
};
export function WorkflowTable({ workflows }: WorkflowTableProps) {
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
    <Card className="flex flex-col gap-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Workflows
            <Button variant="ghost" onClick={refreshData} onKeyPress={refreshData} size="sm">
              <RefreshCcw className="h-3 w-3" />
            </Button>
          </CardTitle>
          <CardDescription>Manage your workflows here.</CardDescription>
        </div>
        {/* <Button onClick={refreshData}>Refresh</Button> */}
        <Link className={buttonVariants({variant: "default"})} href="/workflow">
          Create Workflow
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {error && <div>Error loading history</div>}
        <DataTable columns={columns} data={data} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
