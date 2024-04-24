/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Position } from "@xyflow/react";
import NodeHandle from "../Primitives/NodeHandle";

import React from "react";

import { Separator } from "~/components/ui/separator";

import { CardWithHeader } from "../Primitives/Card";
import InputPrimitive from "../Primitives/Input";

import * as z from "zod";

import { Form } from "@/components/ui/form";
import useBasicNodeState from "~/hooks/useBasicNodeState";
import Debug from "../Primitives/Debug";
type PlaylistProps = {
  id: string;
  data: any;
};

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Playlist is required.",
  }),
  isPublic: z.boolean(),
  collaborative: z.boolean(),
  description: z.string().optional(),
});

const saveAsNewComponent: React.FC<PlaylistProps> = React.memo(
  ({ id, data }) => {
    const {
      state,
      isValid,
      targetConnections,
      sourceConnections,
      form,
      nodeData,
      formState,
      register,
      getNodeData,
      updateNodeData,
    } = useBasicNodeState(id, formSchema);

    const watch = form!.watch();
    const prevWatchRef = React.useRef(watch);

    React.useEffect(() => {
      if (JSON.stringify(prevWatchRef.current) !== JSON.stringify(watch)) {
        updateNodeData(id, {
          name: watch.name,
          isPublic: watch.isPublic === "true",
          collaborative: watch.collaborative === "true",
          description: watch.description,
        });
      }
      prevWatchRef.current = watch;
    }, [id, watch, updateNodeData]);

    return (
      <CardWithHeader
        title="Save as New"
        id={id}
        type="Target"
        status={formState!.isValid ? "success" : "error"}
        info="Get a list of the songs saved in your ‘Your Music’ library."
      >
        <NodeHandle
          type="target"
          position={Position.Left}
          style={{ background: "#555" }}
        />
        <Form {...form!}>
          <form onSubmit={form!.handleSubmit((data) => console.info(data))}>
            <div className="flex flex-col gap-2">
              <InputPrimitive
                control={form!.control}
                name="name"
                inputType={"text"}
                label={"Playlist Name"}
                placeholder="20"
                register={register!}
                description={``}
              />
              <Separator />
              <InputPrimitive
                control={form!.control}
                name="isPublic"
                inputType={"select"}
                label={"Visibility"}
                placeholder="Public"
                register={register!}
                selectOptions={[
                  { value: "true", label: "Public" },
                  { value: "false", label: "Private" },
                ]}
                description={``}
              />
              <Separator />
              <InputPrimitive
                control={form!.control}
                name="collaborative"
                inputType={"select"}
                label={"Collaborative"}
                placeholder="No"
                register={register!}
                selectOptions={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
                description={``}
              />
              <Separator />
              <InputPrimitive
                control={form!.control}
                name="description"
                inputType={"textfield"}
                label={"Description"}
                placeholder="Playlist Description"
                register={register!}
                description={``}
              />
            </div>
          </form>
        </Form>
        <Separator />
        <Debug
          id={id}
          isValid={isValid}
          TargetConnections={targetConnections}
          SourceConnections={sourceConnections}
        />
      </CardWithHeader>
    );
  },
);

export default saveAsNewComponent;
