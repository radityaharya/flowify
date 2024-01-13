/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Handle,
  Position,
} from "@xyflow/react";
import React from "react";

import {
  CardFooter,
} from "@/components/ui/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import useStore from "~/app/states/store";
import { Separator } from "~/components/ui/separator";

import { CardWithHeader } from "../Primitives/Card";
import InputPrimitive from "../Primitives/Input";

import * as z from "zod";

import {
  Form,
} from "@/components/ui/form";
import useBasicNodeState from "~/hooks/useBasicNodeState";
import Debug from "../Primitives/Debug";

type PlaylistProps = {
  id: string;
  data: any;
};

const formSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const PlaylistComponent: React.FC<PlaylistProps> = React.memo(
  ({ id, data }) => {
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
    const session = useStore((state) => state.session);

    const formValid = formState!.isValid;
    const nodeValid = React.useMemo(() => {
      return formValid && isValid;
    }, [formValid, isValid]);

    React.useEffect(() => {
      updateNodeData(id, {
        playlistId: "likedTracks",
        name: "Liked Tracks",
        description: "A list of the songs saved in your ‘Your Music’ library.",
        image: "https://misc.scdn.co/liked-songs/liked-songs-300.png",
        total: watch.limit ?? 50,
        owner: session.user.name,
      });
    }, [watch.limit]);

    return (
      <CardWithHeader
        title="Liked Tracks"
        type="Source"
        status={formState!.isValid ? "success" : "error"}
        info="Get a list of the songs saved in your ‘Your Music’ library."
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
          </form>
        </Form>
        <Separator />
        <Debug
          id={id}
          isValid={nodeValid}
          TargetConnections={targetConnections}
          SourceConnections={sourceConnections}
        />
        <CardFooter></CardFooter>
      </CardWithHeader>
    );
  },
);

export default PlaylistComponent;
