"use client";

import { Position } from "@xyflow/react";
import React from "react";

import useBasicNodeState from "~/hooks/useBasicNodeState";

import { CardWithHeader } from "../Primitives/Card";
import Debug from "../Primitives/Debug";
import NodeHandle from "../Primitives/NodeHandle";
import { SourceList } from "../Primitives/SourceList";

type PlaylistProps = {
  id: string;
  data: any;
};

const AllButLastComponent: React.FC<PlaylistProps> = ({ id, data }) => {
  const { state, isValid, targetConnections, sourceConnections } =
    useBasicNodeState(id);

  return (
    <CardWithHeader
      title={`All But Last`}
      id={id}
      type="Selector"
      status={isValid === null ? "loading" : isValid ? "success" : "error"}
      info="Selects the All elements from the given sources array except the last element"
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
        <SourceList state={state} isValid={isValid} operationType="Selecting" />
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

export default AllButLastComponent;
