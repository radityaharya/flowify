/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Handle, Position } from "@xyflow/react";
import React from "react";

import useBasicNodeState from "~/hooks/useBasicNodeState";
import { CardWithHeader } from "../Primitives/Card";
import Debug from "../Primitives/Debug";
import { SourceList } from "../Primitives/SourceList";
type PlaylistProps = {
  id: string;
  data: any;
};

const DedupeArtistsComponent: React.FC<PlaylistProps> = React.memo(
  ({ id, data }) => {
    const { state, isValid, targetConnections, sourceConnections } =
      useBasicNodeState(id);

    return (
      <CardWithHeader
        title="Shuffle"
        id={id}
        type="Order"
        status={isValid === null ? "loading" : isValid ? "success" : "error"}
        info="Randomly shuffle the order of tracks"
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
        <div className="flex flex-col gap-4">
          <SourceList
            state={state}
            isValid={isValid}
            operationType="Shuffling"
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

export default DedupeArtistsComponent;
