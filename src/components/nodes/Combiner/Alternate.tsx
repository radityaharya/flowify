/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Position } from "@xyflow/react";
import NodeHandle from "../Primitives/NodeHandle";

import React from "react";
import useBasicNodeState from "~/hooks/useBasicNodeState";
import { CardWithHeader } from "../Primitives/Card";
import Debug from "../Primitives/Debug";
import { SourceList } from "../Primitives/SourceList";

type PlaylistProps = {
  id: string;
  data: any;
};

const AlternateComponent: React.FC<PlaylistProps> = React.memo(
  ({ id, data }) => {
    const { state, isValid, targetConnections, sourceConnections } =
      useBasicNodeState(id);

    return (
      <CardWithHeader
        title={`Alternate`}
        id={id}
        type="Combiner"
        status={isValid === null ? "loading" : isValid ? "success" : "error"}
        info="Interleaves the tracks from multiple playlists"
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
          <SourceList
            state={state}
            isValid={isValid}
            operationType="Combining"
          />
          <Debug
            id={id}
            isValid={isValid}
            TargetConnections={targetConnections}
            SourceConnections={sourceConnections}
          />
        </div>
      </CardWithHeader>
    );
  },
);

export default AlternateComponent;
