"use client";

import { Position } from "@xyflow/react";
import React from "react";

import { Separator } from "~/components/ui/separator";
import useBasicNodeState from "~/hooks/useBasicNodeState";

import { CardWithHeader } from "../Primitives/Card";
import Debug from "../Primitives/Debug";
import NodeHandle from "../Primitives/NodeHandle";
import { SourceList } from "../Primitives/SourceList";

type PlaylistProps = {
  id: string;
  data: any;
};

const AlternateComponent: React.FC<PlaylistProps> = ({ id, data }) => {
  const { state, isValid, targetConnections, sourceConnections } =
    useBasicNodeState(id);

  return (
    <CardWithHeader
      title={`Push`}
      id={id}
      type="Combiner"
      status={isValid === null ? "loading" : isValid ? "success" : "error"}
      info="Appends source tracks"
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
      <div className="flex flex-col gap-4">
        <SourceList state={state} isValid={isValid} operationType="Combining" />
        <Separator />
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

export default AlternateComponent;
