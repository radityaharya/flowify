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
  limit: z.number().int().positive().default(0),
});

const LimitComponent: React.FC<PlaylistProps> = ({ id, data }) => {
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

  React.useEffect(() => {
    if (data) {
      form!.reset({
        limit: data.limit,
      });
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
  }, [id, updateNodeData, watch]);

  const formValid = formState!.isValid;

  const nodeValid = React.useMemo(() => {
    return formValid && isValid;
  }, [formValid, isValid]);

  return (
    <CardWithHeader
      title={`Limit`}
      id={id}
      type="Filter"
      status={formState!.isValid ? "success" : "error"}
      info="Limit the number of tracks returned by the playlist."
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
              name="limit"
              inputType={"number"}
              label={"Limit"}
              placeholder="0"
              register={register!}
              description={``}
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
};

export default LimitComponent;
