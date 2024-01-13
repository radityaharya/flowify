/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Handle,
  Position,
} from "@xyflow/react";
import React from "react";

import { InfoIcon } from "lucide-react";

import {
  CardFooter,
} from "@/components/ui/card";



import { Separator } from "~/components/ui/separator";

import { CardWithHeader } from "../Primitives/Card";
import InputPrimitive from "../Primitives/Input";

import * as z from "zod";

import {
  Form,
} from "@/components/ui/form";
import Link from "next/link";
import useBasicNodeState from "~/hooks/useBasicNodeState";
import Debug from "../Primitives/Debug";

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
  const {
    state,
    isValid,
    targetConnections,
    sourceConnections,
    form,
    formState,
    register,
    getNodeData,
    updateNodeData,
  } = useBasicNodeState(id, formSchema);

  const watch = form!.watch();
  const prevWatchRef = React.useRef(watch);

  React.useEffect(() => {
    if (JSON.stringify(prevWatchRef.current) !== JSON.stringify(watch)) {
      const filterValue =
        watch.filterValue && watch.operation
          ? `${watch.operation} ${watch.filterValue}`
          : undefined;

      updateNodeData(id, {
        filterKey: watch.filterKey,
        filterValue: filterValue,
      });
    }
    prevWatchRef.current = watch;
  }, [watch]);

  const formValid = formState!.isValid;

  const nodeValid = React.useMemo(() => {
    return formValid && isValid;
  }, [formValid, isValid]);

  return (
    <CardWithHeader
      title={`Remove Match`}
      type="Filter"
      status={nodeValid ? "success" : "error"}
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
      <Form {...form!}>
        <form onSubmit={form!.handleSubmit((data) => console.log(data))}>
          <div className="flex flex-col gap-4">
            <InputPrimitive
              control={form!.control}
              name="filterKey"
              inputType={"text"}
              label={"Match Key"}
              placeholder="track.artist.name"
              register={register!}
              description={`The JSON key to match
                  
            Example: track.artist.name`}
            />
            <Separator />
            <InputPrimitive
              control={form!.control}
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
              register={register!}
              description={`The operation to perform`}
            />
            <Separator />
            <InputPrimitive
              control={form!.control}
              name="filterValue"
              inputType={"text"}
              label={"Match Value"}
              placeholder="Ichiko Aoba"
              register={register!}
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
      <Debug
        id={id}
        isValid={nodeValid}
        TargetConnections={targetConnections}
        SourceConnections={sourceConnections}
      />
    </CardWithHeader>
  );
});

export default RemoveMatch;
