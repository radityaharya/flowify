/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { memo, useMemo } from "react";
import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";

import { Check, ChevronsUpDown, InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ScrollArea } from "@/components/ui/scroll-area";

import Image from "next/image";
import useStore from "~/app/states/store";
import { Separator } from "~/components/ui/separator";

import { CardWithHeader } from "../Primitives/Card";
import InputPrimitive from "../Primitives/Input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useShallow } from "zustand/react/shallow";
import { debounce } from "radash";
import Link from "next/link";

type PlaylistProps = {
  id: string;
  data: any;
};

type Playlist = {
  playlistId?: string;
  name?: string;
  description?: string;
  image?: string;
  total?: number;
  owner?: string;
};

const formSchema = z.object({
  filterKey: z.string().min(1, {
    message: "Playlist is required.",
  }),
  operation: z.string().min(1, {
    message: "Operation is required.",
  }),
  filterValue: z.string().min(1, {
    message: "Value is required.",
  }),
});

const RemoveMatch: React.FC<PlaylistProps> = React.memo(({ id, data }) => {
  const nodes = useStore((state) => state.nodes);

  const { updateNodeData } = useStore(
    useShallow((state) => ({
      updateNodeData: state.updateNodeData,
    })),
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    // reValidateMode: "onChange",
    // mode: "all",
    shouldUnregister: false,
  });
  const { formState, register } = form;

  const TargetConnections = useHandleConnections({
    type: "target",
  });
  const SourceConnections = useHandleConnections({
    type: "source",
  });

  const getNodeData = useMemo(
    () => (id: string) => nodes.find((node) => node.id === id)?.data,
    [nodes],
  );
  const watch = form.watch();
  const prevWatchRef = React.useRef(watch);

  React.useEffect(() => {
    // if (JSON.stringify(prevWatchRef.current) !== JSON.stringify(watch)) {
    
    // filtervalue is a string of "{watch.operation} {watch.filterValue}" but both have to be present and not undefined or empty
    const filterValue = watch.filterValue && watch.operation ? `${watch.operation} ${watch.filterValue}` : undefined;

    updateNodeData(id, {
      filterKey: watch.filterKey,
      filterValue: filterValue,
    });
    // }
    // prevWatchRef.current = watch;
  }, [watch]);

  return (
    <CardWithHeader
      title={`Remove Match`}
      type="Filter"
      status={formState.isValid ? "success" : "error"}
      info="Get a list of the songs in a playlist."
    >
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#555" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#555" }}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => console.log(data))}>
          <div className="flex flex-col gap-4">
            <InputPrimitive
              control={form.control}
              name="filterKey"
              inputType={"text"}
              label={"Match Key"}
              placeholder="track.artist.name"
              register={register}
              description={`The JSON key to match
                  
            Example: track.artist.name`}
            />
            <Separator />
            <InputPrimitive
              control={form.control}
              name="operation"
              inputType={"select"}
              label={"Operation"}
              placeholder="Select Operation"
              selectOptions={[
                { label: "Less than (<)", value: "<" },
                { label: "Less than or equal to (<=)", value: "<=" },
                { label: "Equal to (==)", value: "==" },
                { label: "Greater than or equal to (>=)", value: ">=" },
                { label: "Greater than (>)", value: ">" },
                { label: "Not equal to (!=)", value: "!=" },
              ]}
              register={register}
              description={`The operation to perform`}
            />
            <Separator />
            <InputPrimitive
              control={form.control}
              name="filterValue"
              inputType={"text"}
              label={"Match Value"}
              placeholder="Ichiko Aoba"
              register={register}
              description={`The JSON value to match to

            
            Supported data types:
            - string 
            - number 
            - boolean 
            - date`}
            />
          </div>
        </form>
      </Form>
      <Separator className="my-2" />
      <div className="flex w-full flex-row gap-2 rounded-md bg-red-500 p-2">
        <InfoIcon size={16} />
        <span className="text-xs">
          Validation will fail if the JSON key does not exist in the data. Refer
          to:{" "}
          <Link
            className="font-medium underline"
            href="https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks"
          >
            Spotify API Reference
          </Link>
        </span>
      </div>
      <Separator className="my-2" />
      <div className="whitespace-pre-wrap rounded-md bg-red-500 p-2 py-2">
        <pre className="whitespace-pre-wrap text-sm font-bold">Debug info</pre>
        <pre>
          <pre className="text-xs">id: {id}</pre>
          <pre className="text-xs">isValid: {formState.isValid.toString()}</pre>
          <pre className="whitespace-pre-wrap break-all text-xs">
            data: {JSON.stringify(getNodeData(id), null, 2)}
          </pre>
        </pre>
        <ScrollArea className="nodrag flex max-h-[200px] flex-col gap-2 overflow-auto overflow-x-hidden py-2">
          <pre className="text-xs">TargetConnections:</pre>
          {TargetConnections?.map((connection) => (
            <pre key={connection.source} className="py-1 text-xs">
              <pre>source: {connection.source}</pre>
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(getNodeData(connection.source), null, 2)}
              </pre>
            </pre>
          ))}

          <pre className="text-xs">SourceConnections:</pre>
          {SourceConnections?.map((connection) => (
            <pre key={connection.source} className="py-1 text-xs">
              <pre>source: {connection.source}</pre>
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(getNodeData(connection.target), null, 2)}
              </pre>
            </pre>
          ))}
        </ScrollArea>
      </div>
      <CardFooter></CardFooter>
    </CardWithHeader>
  );
});

export default React.memo(RemoveMatch);
