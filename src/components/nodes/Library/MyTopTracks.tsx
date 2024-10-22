/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Position } from "@xyflow/react";
import NodeHandle from "../Primitives/NodeHandle";

import React, { useEffect, useMemo } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import useStore from "~/app/states/store";

import { CardWithHeader } from "../Primitives/Card";
import InputPrimitive from "../Primitives/Input";

import * as z from "zod";

import { Form } from "@/components/ui/form";
import { useWatch } from "react-hook-form";
import useBasicNodeState from "~/hooks/useBasicNodeState";
import Debug from "../Primitives/Debug";

type TopTracksProps = {
  id: string;
  data: any;
};

const formSchema = z.object({
  timeRange: z.string().default("short_term"),
  limit: z.number().default(20),
  offset: z.number().default(0),
});

const timeRangeOptions = [
  { label: "Short Term", value: "short_term" },
  { label: "Medium Term", value: "medium_term" },
  { label: "Long Term", value: "long_term" },
];

const MyTopTracksComponent: React.FC<TopTracksProps> = ({ id, data }) => {
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

  useEffect(() => {
    if (data) {
      form!.setValue("timeRange", data.timeRange);
      form!.setValue("limit", data.limit);
      form!.setValue("offset", data.offset);
    } else {
      form!.setValue("limit", 20);
      form!.setValue("offset", 0);
      form!.setValue("timeRange", "short_term");
    }
    form!.trigger();
  }, [data, form]);

  const limit = useWatch({ control: form!.control, name: "limit" });
  const offset = useWatch({ control: form!.control, name: "offset" });
  const session = useStore((state) => state.session);

  const formValid = formState!.isValid;
  const nodeValid = useMemo(() => formValid && isValid, [formValid, isValid]);

  useEffect(() => {
    updateNodeData(id, {
      playlistId: "topTracks",
      name: "Top Tracks",
      description: "A list of the most played songs",
      image: "https://misc.scdn.co/liked-songs/liked-songs-300.png",
      total: limit ?? 50,
      owner: session?.user?.name ?? "Unknown",
      offset: offset ?? 0,
      limit: limit ?? 20,
    });
  }, [limit, offset, id, updateNodeData, session?.user?.name]);

  return (
    <CardWithHeader
      title="Top Tracks"
      id={id}
      type="Source"
      status={formState!.isValid ? "success" : "error"}
      info="Get a list of the most played songs"
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
              name="timeRange"
              inputType={"select"}
              label={"Time Range"}
              placeholder={
                form!.watch().timeRange
                  ? timeRangeOptions.find(
                      (option) => option.value === form!.watch().timeRange,
                    )!.label
                  : "Medium Term"
              }
              selectOptions={timeRangeOptions}
              register={register!}
              description={`The time range of the top tracks. Default: medium_term
                
                - short_term: 4 weeks
                - medium_term: 6 months
                - long_term: ~1 year
                `}
            />
            <Accordion type="single" collapsible className="border-none">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">Config</AccordionTrigger>
                <AccordionContent className="flex w-full flex-col gap-4 p-1">
                  <InputPrimitive
                    control={form!.control}
                    name="limit"
                    inputType={"number"}
                    label={"Limit"}
                    placeholder="20"
                    register={register!}
                    description={`The maximum number of items to return. Default: 20. Minimum: 1. 
                            
                Maximum: 50.
                Default: limit=20
                Range: 0 - 50
                Example: limit=10`}
                  />
                  <InputPrimitive
                    control={form!.control}
                    name="offset"
                    inputType={"number"}
                    label={"Offset"}
                    placeholder="0"
                    register={register!}
                    description={`The index of the first item to return. Default: 0 (the first item). Use with limit to get the next set of items.

                Default: offset=0
                Example: offset=5`}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </form>
      </Form>
      <Debug
        id={id}
        isValid={nodeValid}
        TargetConnections={targetConnections}
        SourceConnections={sourceConnections}
      />
    </CardWithHeader>
  );
};

export default MyTopTracksComponent;
