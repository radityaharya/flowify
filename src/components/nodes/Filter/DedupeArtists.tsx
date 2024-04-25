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

const DedupeArtistsComponent: React.FC<PlaylistProps> = ({ id, data }) => {
  const { state, isValid, targetConnections, sourceConnections } =
    useBasicNodeState(id);

  return (
    <CardWithHeader
      title="Dedupe Artists"
      id={id}
      type="Filter"
      status={isValid === null ? "loading" : isValid ? "success" : "error"}
      info="Remove duplicate artists from multiple playlists"
    >
      <NodeHandle
        type="source"
        position={Position.Right}
        style={{
          background: "#fff",
          padding: "0.2rem",
          borderRadius: "0.5px",
          border: "1px solid #555",
        }}
      />
      <NodeHandle
        type="target"
        position={Position.Left}
        style={{
          background: "#fff",
          padding: "0.2rem",
          borderRadius: "0.5px",
          border: "1px solid #555",
        }}
      />
      <div className="flex flex-col gap-4">
        <SourceList state={state} isValid={isValid} operationType="Filtering" />
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

export default DedupeArtistsComponent;
