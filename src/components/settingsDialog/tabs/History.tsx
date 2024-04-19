import React, { useState } from "react";
import useSWR from "swr";
import useStore from "~/app/states/store";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

type HistoryResponseItem = {
  id: string;
  startedAt: string;
  completedAt: string;
  status: string;
  returnValues: string[];
};

type HistoryResponse = {
  id: string;
  runs: HistoryResponseItem[];
};

const columns: ColumnDef<HistoryResponseItem>[] = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Started At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "startedAt",
  },
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Completed At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "completedAt",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row, getValue }) => {
      const value = getValue();
      return (
        <Badge variant={value === "completed" ? "default" : "destructive"}>
          {value as React.ReactNode}
        </Badge>
      );
    },
  },
  {
    header: "Return Values",
    accessorKey: "returnValues", // TODO: temp
  },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
}

function DataTable<TData, TValue>({
  columns,
  data = [],
  isLoading,
}: DataTableProps<TData, TValue> & { isLoading: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([])
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

  return (
    <div className="rounded-md border">
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
            [...Array(10)].map((_, index) => (
              <TableRow key={index}>
                {columns.map((column, columnIndex) => (
                  <TableCell key={columnIndex}>
                    <Skeleton className="h-[20px] w-[100px] rounded-full" />
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

const fetcher = async (url) => {
  const res = await fetch(url as string);
  if (!res.ok) {
    const error = {
      status: res.status,
      info: "An error occurred while fetching the data.",
    };
    const json = await res.json();
    error.info = json.error;
    throw error;
  }

  const data = (await res.json()) as HistoryResponse;
  const runs = data.runs.map((run) => ({
    ...run,
    startedAt: run.startedAt ? new Date(run.startedAt).toLocaleString() : 'N/A',
    completedAt: run.completedAt ? new Date(run.completedAt).toLocaleString() : 'N/A',
    status: run.status || 'unknown',
    returnValues: `${run.returnValues.length} Tracks`,
  }));

  return runs;
};

const History = () => {
  const { flowState } = useStore((state) => ({
    flowState: state.flowState,
  }));

  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    error,
    isLoading: isSWRLoading,
    mutate,
  } = useSWR<any[] | undefined>(
    flowState ? `/api/workflow/${flowState.id}/history` : null,
    fetcher,
  );

  const isLoading = isSWRLoading || isRefreshing;

  const refreshData = async () => {
    setIsRefreshing(true);
    await mutate();
    setIsRefreshing(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="mb-2 text-xl font-semibold leading-none tracking-tight">
            History
          </h2>
          <Button onClick={refreshData}>Refresh</Button>
        </div>
        <div className="space-y-1">
          {error && <div>Error loading history</div>}
          <DataTable columns={columns} data={data} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
};

export default History;
