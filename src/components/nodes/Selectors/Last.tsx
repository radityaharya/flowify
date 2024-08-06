"use client";

import { Form } from "@/components/ui/form";
import { Position } from "@xyflow/react";
import React from "react";
import * as z from "zod";
import { Separator } from "~/components/ui/separator";
import useBasicNodeState from "~/hooks/useBasicNodeState";
import { CardWithHeader } from "../Primitives/Card";
import Debug from "../Primitives/Debug";
import InputPrimitive from "../Primitives/Input";
import NodeHandle from "../Primitives/NodeHandle";
import { SourceList } from "../Primitives/SourceList";

type PlaylistProps = {
  id: string;
  data: { count: number };
};

const formSchema = z.object({
  count: z.number().int().default(1),
});

const LastComponent: React.FC<PlaylistProps> = ({ id, data }) => {
  const {
    state,
    isValid,
    targetConnections,
    sourceConnections,
    form,
    formState,
    register,
    updateNodeData,
  } = useBasicNodeState(id, formSchema);

  const watch = form!.watch();
  const prevWatchRef = React.useRef(watch);

  React.useEffect(() => {
    if (data && form) {
      form.setValue("count", data.count);
      form.trigger();
    }
  }, [data, form]);

  React.useEffect(() => {
    if (JSON.stringify(prevWatchRef.current) !== JSON.stringify(watch)) {
      updateNodeData(id, {
        count: watch.count,
      });
    }
    prevWatchRef.current = watch;
  }, [id, watch, updateNodeData]);

  return (
    <CardWithHeader
      title={`Last`}
      id={id}
      type="Selector"
      status={isValid === null ? "loading" : isValid ? "success" : "error"}
      info="Selects the last N element(s) from a stream"
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
          <div className="flex flex-col gap-2">
            <InputPrimitive
              control={form!.control}
              name="count"
              inputType={"textfield"}
              label={"Count"}
              placeholder="1"
              register={register!}
              description={`Last N elements to pick
                

                default: 1
                `}
            />
          </div>
        </form>
      </Form>
      <Separator className="my-4" />
      <SourceList state={state} isValid={isValid} operationType="Selecting" />
      <div className="flex flex-col gap-4">
        <Debug
          id={id}
          isValid={isValid}
          TargetConnections={targetConnections}
          SourceConnections={sourceConnections}
        />
      </div>
    </CardWithHeader>
  );
};

export default LastComponent;
