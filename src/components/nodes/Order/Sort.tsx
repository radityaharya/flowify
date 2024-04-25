/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Position } from "@xyflow/react";
import NodeHandle from "../Primitives/NodeHandle";

import React from "react";

import { InfoIcon } from "lucide-react";

import { Separator } from "~/components/ui/separator";

import { CardWithHeader } from "../Primitives/Card";
import InputPrimitive from "../Primitives/Input";

import * as z from "zod";

import { Form } from "@/components/ui/form";
import Link from "next/link";
import useBasicNodeState from "~/hooks/useBasicNodeState";
import Debug from "../Primitives/Debug";

type PlaylistProps = {
  id: string;
  data: any;
};

const formSchema = z.object({
  sortKey: z.string().min(1, {
    message: "Playlist is required.",
  }),
  sortOrder: z
    .string()
    .min(1, {
      message: "Operation is required.",
    })
    .default("asc"),
});

const sortOptions = [
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
];

const RemoveMatch: React.FC<PlaylistProps> = ({ id, data }) => {
  const {
    isValid,
    targetConnections,
    sourceConnections,
    form,
    formState,
    register,
    updateNodeData,
  } = useBasicNodeState(id, formSchema);

  React.useEffect(() => {
    if (data) {
      const parsedData = {
        sortKey: data.sortKey,
        sortOrder: data.sortOrder,
      };
      form!.reset(parsedData);
      form?.setValue("sortOrder", parsedData.sortOrder);
    }
  }, [data, form]);

  const watch = form!.watch();
  const prevWatchRef = React.useRef(watch);

  React.useEffect(() => {
    if (JSON.stringify(prevWatchRef.current) !== JSON.stringify(watch)) {
      updateNodeData(id, {
        ...watch,
      });
    }
    prevWatchRef.current = watch;
  }, [watch, id, updateNodeData]);

  return (
    <CardWithHeader
      title={"Sort"}
      id={id}
      type="Order"
      status={formState!.isValid ? "success" : "error"}
      info="Sorts the input based on the given key and order"
    >
      <NodeHandle
        type="source"
        position={Position.Right}
        style={{ background: "#555" }}
      />
      <NodeHandle
        type="target"
        position={Position.Left}
        style={{ background: "#555" }}
      />
      <Form {...form!}>
        <form onSubmit={form!.handleSubmit((data) => console.info(data))}>
          <div className="flex flex-col gap-4">
            <InputPrimitive
              control={form!.control}
              name="sortKey"
              inputType={"text"}
              label={"Sort Key"}
              placeholder="track.artists[0].name"
              register={register!}
              description={`The JSON key to match for sorting
                  
            Example: track.artists[0].name`}
            />
            <Separator />
            <InputPrimitive
              control={form!.control}
              name="sortOrder"
              inputType={"select"}
              label={"Sort Order"}
              placeholder={
                watch.sortOrder
                  ? sortOptions.find(
                      (option) => option.value === watch.sortOrder,
                    )!.label
                  : "Ascending"
              }
              selectOptions={sortOptions}
              register={register!}
              description={`The order to sort the results by`}
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
        isValid={isValid}
        TargetConnections={targetConnections}
        SourceConnections={sourceConnections}
      />
    </CardWithHeader>
  );
};

export default RemoveMatch;
